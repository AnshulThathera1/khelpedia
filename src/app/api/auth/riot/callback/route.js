import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host");
  // Don't use process.env.NEXT_PUBLIC_SITE_URL here if we want localhost to work independently,
  // but it's safe to just use the actual accessed host.
  const origin = `${protocol}://${host}`;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('RSO Error:', error);
    return NextResponse.redirect(`${origin}/dashboard?error=rso_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  try {
    const clientId = process.env.RIOT_CLIENT_ID;
    const clientSecret = process.env.RIOT_CLIENT_SECRET;
    const redirectUri = `${origin}/api/auth/riot/callback`;

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://auth.riotgames.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error('Failed to fetch RSO token:', err);
      return NextResponse.redirect(`${origin}/login?error=rso_token_failed`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // 2. Fetch User Profile (PUUID, gameName, tagLine) using the access token
    const profileResponse = await fetch('https://americas.api.riotgames.com/riot/account/v1/accounts/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      const err = await profileResponse.text();
      console.error('Failed to fetch Riot profile:', err);
      return NextResponse.redirect(`${origin}/login?error=rso_profile_failed`);
    }

    const profile = await profileResponse.json();
    const { puuid, gameName, tagLine } = profile;

    // 3. Sync with Supabase Auth
    const email = `${puuid}@riot.khelpedia.com`;
    // We generate a long secure temporary password for this session
    // Since we don't store it, they will just generate a new one via OAuth next time
    const tempPassword = crypto.randomUUID() + crypto.randomUUID(); 

    const adminClient = createAdminClient();
    
    // Check if user exists
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
      // Create a new user mapping to the Riot PUUID
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          riot_puuid: puuid,
          game_name: gameName,
          tag_line: tagLine,
          provider: 'riot'
        }
      });
      if (createError) throw createError;
      user = newUser.user;
    } else {
      // User exists, update password so we can sign in right now
      const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, { 
        password: tempPassword,
        user_metadata: {
          ...user.user_metadata,
          game_name: gameName,
          tag_line: tagLine
        }
      });
      if (updateError) throw updateError;
    }

    // 4. Sign in the user using the standard SSR client to set the cookies
    const supabaseClient = await createClient();
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: tempPassword
    });

    if (signInError) throw signInError;

    // 5. Redirect to Dashboard
    return NextResponse.redirect(`${origin}/dashboard?rso=success`);

  } catch (err) {
    console.error('RSO flow exception:', err);
    return NextResponse.redirect(`${origin}/login?error=rso_exception`);
  }
}
