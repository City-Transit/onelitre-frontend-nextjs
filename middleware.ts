import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has('session_access_token');
  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/vendor/:path*', '/admin/:path*'],
};
