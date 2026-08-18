import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

// -----------------------------------------------------------------------------
// Gate everything behind the session cookie.
//
// This is Next 16's `proxy` convention — the rename of what used to be
// `middleware`. Same behaviour, same matcher semantics.
//
// Default-deny: the matcher below excludes only the login page, the login API,
// the machine-to-machine lead ingest, and Next's own static assets. Any route
// added later is protected without anyone remembering to protect it — the
// opposite of the deleted ops dashboard, which had no login at all and relied
// on nobody guessing the URL.
//
// Every exemption here MUST do its own auth. /api/leads/ingest checks a shared
// secret (lib/auth.ts:checkIngestKey) because its caller is a serverless
// function on another origin and has no session cookie to present.
// -----------------------------------------------------------------------------

export default async function proxy(request: NextRequest) {
  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  // Preserve where they were headed so login can bounce them back.
  const { pathname, search } = request.nextUrl;
  if (pathname !== '/') loginUrl.searchParams.set('next', pathname + search);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!login|api/auth/login|api/leads/ingest|_next/static|_next/image|favicon.ico).*)',
  ],
};
