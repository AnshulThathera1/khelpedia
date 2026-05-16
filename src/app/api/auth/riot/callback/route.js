import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('RSO Error:', error);
    return NextResponse.redirect(`${origin}/dashboard?error=rso_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // NOTE: Once you have RIOT_RSO_CLIENT_ID and RIOT_RSO_CLIENT_SECRET,
  // we will add the logic here to exchange the code for a token and fetch the PUUID.
  
  console.log('Received RSO code:', code);

  // For now, we'll just redirect back with a "pending" message
  return NextResponse.redirect(`${origin}/dashboard?rso=pending`);
}
