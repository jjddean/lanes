import { NextRequest, NextResponse } from "next/server";

type HmrcTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

function fallbackReturnTo() {
  return "/dashboard/compliance";
}

function sanitizeReturnTo(value: string | null) {
  if (!value) return fallbackReturnTo();
  if (!value.startsWith("/") || value.startsWith("//")) return fallbackReturnTo();
  return value;
}

function getHmrcAuthorizeUrl() {
  if (process.env.HMRC_AUTHORIZE_URL) return process.env.HMRC_AUTHORIZE_URL;
  const env = (process.env.HMRC_ENVIRONMENT ?? "sandbox").toLowerCase();
  return env === "production"
    ? "https://api.service.hmrc.gov.uk/oauth/authorize"
    : "https://test-api.service.hmrc.gov.uk/oauth/authorize";
}

function getHmrcScopes() {
  const raw =
    process.env.HMRC_SCOPES ??
    process.env.HMRC_SCOPE ??
    "read:customs-declarations write:customs-declarations";
  return raw
    .split(/[,\s]+/)
    .filter(Boolean)
    .join(" ");
}

function getHmrcTokenUrl() {
  if (process.env.HMRC_TOKEN_URL) return process.env.HMRC_TOKEN_URL;
  const env = (process.env.HMRC_ENVIRONMENT ?? "sandbox").toLowerCase();
  return env === "production"
    ? "https://api.service.hmrc.gov.uk/oauth/token"
    : "https://test-api.service.hmrc.gov.uk/oauth/token";
}

function setTokenCookies(response: NextResponse, token: HmrcTokenResponse) {
  const expiresIn = Math.max(60, Math.floor(token.expires_in));

  response.cookies.set("hmrc_access_token", token.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: expiresIn,
    path: "/",
  });

  response.cookies.set("hmrc_token_type", token.token_type, {
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

  if (token.refresh_token) {
    response.cookies.set("hmrc_refresh_token", token.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  if (token.scope) {
    response.cookies.set("hmrc_scope", token.scope, {
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
}

export async function GET(request: NextRequest) {
  const returnTo = sanitizeReturnTo(request.nextUrl.searchParams.get("returnTo"));

  try {
    const clientId = process.env.HMRC_CLIENT_ID;
    const clientSecret = process.env.HMRC_CLIENT_SECRET;
    const redirectUri = process.env.HMRC_REDIRECT_URI;
    const tokenUrl = getHmrcTokenUrl();
    const authorizeUrl = getHmrcAuthorizeUrl();
    const authMode = (process.env.HMRC_AUTH_MODE ?? "client_credentials").toLowerCase();

    // Keep old working behavior by default (app-level token, no user consent redirect).
    if (authMode !== "authorization_code") {
      if (!clientId || !clientSecret) {
        const redirectUrl = new URL(returnTo, request.url);
        redirectUrl.searchParams.set("hmrc", "error");
        redirectUrl.searchParams.set("reason", "missing_hmrc_env");
        redirectUrl.searchParams.set("detail", "HMRC_CLIENT_ID / HMRC_CLIENT_SECRET not set");
        return NextResponse.redirect(redirectUrl);
      }

      const body = new URLSearchParams();
      body.set("grant_type", "client_credentials");
      body.set("client_id", clientId);
      body.set("client_secret", clientSecret);

      const hmrcRes = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        cache: "no-store",
      });

      const raw = await hmrcRes.text();
      let parsed: any = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        parsed = null;
      }

      if (!hmrcRes.ok) {
        const redirectUrl = new URL(returnTo, request.url);
        redirectUrl.searchParams.set("hmrc", "error");
        redirectUrl.searchParams.set("reason", parsed?.error ?? `token_http_${hmrcRes.status}`);
        redirectUrl.searchParams.set("detail", parsed?.error_description ?? raw.slice(0, 180));
        return NextResponse.redirect(redirectUrl);
      }

      const token = parsed as HmrcTokenResponse;
      if (!token?.access_token || !token?.token_type || !token?.expires_in) {
        const redirectUrl = new URL(returnTo, request.url);
        redirectUrl.searchParams.set("hmrc", "error");
        redirectUrl.searchParams.set("reason", "invalid_token_payload");
        return NextResponse.redirect(redirectUrl);
      }

      const redirectUrl = new URL(returnTo, request.url);
      redirectUrl.searchParams.set("hmrc", "connected");
      const response = NextResponse.redirect(redirectUrl);
      setTokenCookies(response, token);

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
    }

    if (!clientId || !redirectUri) {
      const redirectUrl = new URL(returnTo, request.url);
      redirectUrl.searchParams.set("hmrc", "error");
      redirectUrl.searchParams.set("reason", "missing_hmrc_env");
      redirectUrl.searchParams.set("detail", "HMRC_CLIENT_ID / HMRC_REDIRECT_URI not set");
      return NextResponse.redirect(redirectUrl);
    }

    const state =
      globalThis.crypto?.randomUUID?.().replace(/-/g, "") ??
      `${Date.now()}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;

    const hmrcAuthorize = new URL(authorizeUrl);
    hmrcAuthorize.searchParams.set("response_type", "code");
    hmrcAuthorize.searchParams.set("client_id", clientId);
    hmrcAuthorize.searchParams.set("redirect_uri", redirectUri);
    hmrcAuthorize.searchParams.set("scope", getHmrcScopes());
    hmrcAuthorize.searchParams.set("state", state);

    const response = NextResponse.redirect(hmrcAuthorize);

    response.cookies.set("hmrc_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    response.cookies.set("hmrc_oauth_return_to", returnTo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    return response;
  } catch (error: any) {
    const redirectUrl = new URL(returnTo, request.url);
    redirectUrl.searchParams.set("hmrc", "error");
    redirectUrl.searchParams.set("reason", "connect_exception");
    redirectUrl.searchParams.set("detail", (error?.message ?? "Unknown connect error").slice(0, 180));
    return NextResponse.redirect(redirectUrl);
  }
}
