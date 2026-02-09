import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/settings', '/onboarding'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Check for Better Auth session cookie (supports multiple cookie name patterns)
  const sessionCookie = request.cookies.get('better-auth.session_token') || 
                        request.cookies.get('session_token') ||
                        request.cookies.get('plots_session');

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing login/signup with active session
  if ((pathname === '/login' || pathname === '/signup') && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|plots.js).*)',
  ],
};

