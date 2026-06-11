import { NextResponse } from 'next/server';

export async function GET(request) {
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  
  const clientId = process.env.RIOT_CLIENT_ID;
  const redirectUri = `${origin}/api/auth/riot/callback`;
  
  if (!clientId) {
    return NextResponse.json({ error: "Riot Client ID not configured" }, { status: 500 });
  }

  // Construct the Riot Sign On authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid',
  });

  const authUrl = `https://auth.riotgames.com/authorize?${params.toString()}`;

  // Redirect the user to Riot Games
  return NextResponse.redirect(authUrl);
}
