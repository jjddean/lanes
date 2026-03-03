import { NextRequest, NextResponse } from "next/server";

function fallbackReturnTo() {
  return "/dashboard/compliance";
}

function sanitizeReturnTo(value: string | null) {
  if (!value) return fallbackReturnTo();
  if (!value.startsWith("/") || value.startsWith("//")) return fallbackReturnTo();
  return value;
}

function buildReturnUrl(request: NextRequest) {
  const returnTo = sanitizeReturnTo(request.cookies.get("hmrc_oauth_return_to")?.value ?? null);
  return new URL(returnTo, request.url);
}

type HmrcTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

function getHmrcTokenUrl() {
  if (process.env.HMRC_TOKEN_URL) return process.env.HMRC_TOKEN_URL;
  const env = (process.env.HMRC_ENVIRONMENT ?? "sandbox").toLowerCase();
  return env === "production"
    ? "https://api.service.hmrc.gov.uk/oauth/token"
    : "https://test-api.service.hmrc.gov.uk/oauth/token";
}

async function exchangeCodeForToken(code: string) {
  const clientId = process.env.HMRC_CLIENT_ID;
  const clientSecret = process.env.HMRC_CLIENT_SECRET;
  const redirectUri = process.env.HMRC_REDIRECT_URI;
  const tokenUrl = getHmrcTokenUrl();

  if (!clientId || !clientSecret || !redirectUri) {
    return {
      ok: false as const,
      reason: "missing_hmrc_env",
      detail: "HMRC_CLIENT_ID / HMRC_CLIENT_SECRET / HMRC_REDIRECT_URI not set",
    };
  }

  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("redirect_uri", redirectUri);
  params.set("client_id", clientId);

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: params.toString(),
    cache: "no-store",
  });

  const payloadText = await res.text();
  let parsed: any = null;
  try {
    parsed = payloadText ? JSON.parse(payloadText) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    return {
      ok: false as const,
      reason: parsed?.error ?? `token_http_${res.status}`,
      detail: parsed?.error_description ?? payloadText.slice(0, 180),
    };
  }

  const token = parsed as HmrcTokenResponse;
  if (!token?.access_token || !token?.token_type || !token?.expires_in) {
    return {
      ok: false as const,
      reason: "invalid_token_payload",
      detail: "HMRC token response missing required fields",
    };
  }

  return {
    ok: true as const,
    token,
  };
}

export async function GET(request: NextRequest) {
  const redirectUrl = buildReturnUrl(request);
  try {
    const params = request.nextUrl.searchParams;
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");
    const errorDescription = params.get("error_description");
    const expectedState = request.cookies.get("hmrc_oauth_state")?.value ?? null;

    if (error) {
      redirectUrl.searchParams.set("hmrc", "error");
      redirectUrl.searchParams.set("reason", error);
      if (errorDescription) {
        redirectUrl.searchParams.set("detail", errorDescription);
      }
      return NextResponse.redirect(redirectUrl);
    }

    if (!code) {
      redirectUrl.searchParams.set("hmrc", "error");
      redirectUrl.searchParams.set("reason", "missing_code");
      return NextResponse.redirect(redirectUrl);
    }

    if (!state || !expectedState || state !== expectedState) {
      redirectUrl.searchParams.set("hmrc", "error");
      redirectUrl.searchParams.set("reason", "invalid_state");
      return NextResponse.redirect(redirectUrl);
    }

    const exchange = await exchangeCodeForToken(code);
    if (!exchange.ok) {
      redirectUrl.searchParams.set("hmrc", "error");
      redirectUrl.searchParams.set("reason", exchange.reason);
      if (exchange.detail) {
        redirectUrl.searchParams.set("detail", exchange.detail);
      }
      return NextResponse.redirect(redirectUrl);
    }

    redirectUrl.searchParams.set("hmrc", "connected");
    const response = NextResponse.redirect(redirectUrl);

    const expiresIn = Math.max(60, Math.floor(exchange.token.expires_in));

    response.cookies.set("hmrc_access_token", exchange.token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });

    response.cookies.set("hmrc_token_type", exchange.token.token_type, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });

    response.cookies.set("hmrc_token_expires_at", (Date.now() + expiresIn * 1000).toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn,
      path: "/",
    });

    if (exchange.token.refresh_token) {
      response.cookies.set("hmrc_refresh_token", exchange.token.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    if (exchange.token.scope) {
      response.cookies.set("hmrc_scope", exchange.token.scope, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: expiresIn,
        path: "/",
      });
    }

    response.cookies.set("hmrc_connected_at", Date.now().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    response.cookies.set("hmrc_oauth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("hmrc_oauth_return_to", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: any) {
    redirectUrl.searchParams.set("hmrc", "error");
    redirectUrl.searchParams.set("reason", "callback_exception");
    redirectUrl.searchParams.set("detail", (error?.message ?? "Unknown callback error").slice(0, 180));
    return NextResponse.redirect(redirectUrl);
  }
}
