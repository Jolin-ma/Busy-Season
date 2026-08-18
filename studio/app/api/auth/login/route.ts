import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, checkPassword, createSessionToken } from '@/lib/auth';

/**
 * Only same-origin, path-relative destinations are allowed back out of login.
 * Rejecting `//evil.com` matters as much as rejecting `https://evil.com` —
 * a protocol-relative URL is a working off-site redirect in every browser.
 */
function safeNext(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = form.get('password');
  const next = safeNext(form.get('next'));

  const ok = typeof password === 'string' && (await checkPassword(password));
  const token = ok ? await createSessionToken() : null;

  // 303 so the browser follows with GET rather than re-POSTing.
  if (!ok || !token) {
    const back = new URL('/login', request.url);
    back.searchParams.set('error', '1');
    if (next !== '/') back.searchParams.set('next', next);
    return NextResponse.redirect(back, 303);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}
