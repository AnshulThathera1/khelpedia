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
    const supabaseClient = await createClient();
    const { data: { session } } = await supabaseClient.auth.getSession();
    const adminClient = createAdminClient();

    let userId;

    if (session) {
      // LINKING FLOW: User is already logged in, link the Riot account to current session
      userId = session.user.id;
      
      // Update user metadata
      await adminClient.auth.admin.updateUserById(userId, { 
        user_metadata: {
          ...session.user.user_metadata,
          riot_puuid: puuid,
          game_name: gameName,
          tag_line: tagLine
        }
      });
    } else {
      // LOGIN FLOW: User is not logged in, create/login as Riot user
      const email = `${puuid.toLowerCase()}@riot.khelpedia.com`;
      const tempPassword = crypto.randomUUID() + crypto.randomUUID(); 
      
      // Check if user exists (with pagination support in case of >50 users)
      let user = null;
      let page = 1;
      while (true) {
        const { data, error: listError } = await adminClient.auth.admin.listUsers({ page: page, perPage: 100 });
        if (listError) throw new Error("List Users Error: " + listError.message);
        if (!data || !data.users || data.users.length === 0) break;
        
        user = data.users.find(u => u.email === email);
        if (user) break;
        page++;
      }

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

      userId = user.id;

      // Sign in the user using the standard SSR client to set the cookies
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: tempPassword
      });

      if (signInError) throw signInError;
    }

    // 4. Link the valorant_accounts table to the user
    // We use adminClient to bypass RLS and ensure the account is updated/inserted correctly
    const { error: dbError } = await adminClient.from('valorant_accounts').upsert({
      puuid: puuid,
      game_name: gameName,
      tag_line: tagLine,
      user_id: userId,
      last_updated: new Date().toISOString()
    }, { onConflict: 'game_name, tag_line' });

    if (dbError) {
      console.error('Failed to link valorant_accounts:', dbError);
    }

    // 5. Redirect to Dashboard
    return NextResponse.redirect(`${origin}/dashboard?rso=success`);

  } catch (err) {
    console.error('RSO flow exception:', err);
    // Append the error message to the URL to help debugging (truncate to 100 chars)
    const errMsg = encodeURIComponent(err?.message?.substring(0, 100) || 'unknown');
    return NextResponse.redirect(`${origin}/login?error=rso_exception&details=${errMsg}`);
  }
}
