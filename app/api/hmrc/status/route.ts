import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("hmrc_access_token")?.value;
  const scope = request.cookies.get("hmrc_scope")?.value ?? null;
  const tokenType = request.cookies.get("hmrc_token_type")?.value ?? null;
  const expiresAtRaw = request.cookies.get("hmrc_token_expires_at")?.value;
  const connectedAtRaw = request.cookies.get("hmrc_connected_at")?.value;
  const refreshToken = request.cookies.get("hmrc_refresh_token")?.value;

  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : null;
  const connectedAt = connectedAtRaw ? Number(connectedAtRaw) : null;
  const now = Date.now();
  const isExpired = expiresAt ? now >= expiresAt : false;
  const connected = Boolean(accessToken) && !isExpired;

  return NextResponse.json({
    connected,
    isExpired,
    scope,
    tokenType,
    expiresAt,
    connectedAt,
    hasRefreshToken: Boolean(refreshToken),
  });
}

