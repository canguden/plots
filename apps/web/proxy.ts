import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Proxy middleware - no auth checks to avoid redirect loops
// Better Auth documentation: Let pages handle authentication, not middleware
export default async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|plots.js).*)',
  ],
};

