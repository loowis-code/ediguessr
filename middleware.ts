import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateSessionId } from './lib/session';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Check if session ID cookie exists
  const sessionId = request.cookies.get('session_id')?.value;

  if (!sessionId) {
    // Generate new session ID for guest user
    const newSessionId = generateSessionId();
    response.cookies.set('session_id', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
