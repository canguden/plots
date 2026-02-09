import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/settings', '/onboarding'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const sessionCookie = getSessionCookie(request);
    
    // THIS IS NOT SECURE - only for UX (optimistic redirect)
    // Real auth validation happens in each page
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname === '/login' || pathname === '/signup') {
    const sessionCookie = getSessionCookie(request);
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|plots.js).*)',
  ],
};

