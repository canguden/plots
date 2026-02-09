import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  // Disable server-side auth checks - Better Auth handles this on the client
  // The middleware was causing issues with session detection across domains
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|plots.js).*)',
  ],
};

