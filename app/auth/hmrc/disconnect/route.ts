import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/dashboard/compliance";
  const redirectUrl = new URL(returnTo, request.url);
  redirectUrl.searchParams.set("hmrc", "disconnected");

  const response = NextResponse.redirect(redirectUrl);
  const cookieNames = [
    "hmrc_access_token",
    "hmrc_refresh_token",
    "hmrc_scope",
    "hmrc_token_type",
    "hmrc_token_expires_at",
    "hmrc_connected_at",
    "hmrc_oauth_state",
    "hmrc_oauth_return_to",
  ];

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
  }

  return response;
}
