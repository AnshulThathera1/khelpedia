import { updateSession } from '@/utils/supabase/middleware'

import { NextResponse } from 'next/server'

export async function middleware(request) {
  const hostname = request.headers.get('host') || '';

  // If the request is coming from the Vercel domain, redirect to the .org domain
  if (hostname.includes('khelpedia.vercel.app')) {
    const url = request.nextUrl.clone();
    url.host = 'khelpedia.org';
    url.port = ''; // Ensure no port is attached
    url.protocol = 'https:';
    
    // Return a 301 Permanent Redirect
    return NextResponse.redirect(url, 301);
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
