// -----------------------------------------------------------------------------
// Single-password auth.
//
// One user (the founder), so there are no accounts — just a password in an env
// var and a signed cookie proving you entered it. Deliberately proportionate,
// but note what it is NOT: there is no per-user identity, so nothing here can
// tell two people apart. If a second person ever needs access, replace this
// rather than sharing the password.
//
// Everything uses Web Crypto rather than node:crypto so the same helpers run in
// Edge middleware and in Node route handlers without a second implementation.
// -----------------------------------------------------------------------------

export const SESSION_COOKIE = 'studio_session';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const encoder = new TextEncoder();

/**
 * Constant-time comparison. A plain `===` on a secret leaks its length and, in
 * principle, its content through timing — cheap to avoid, so avoid it.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  // Compare lengths without an early return, then fold the result in.
  let diff = aBytes.length ^ bBytes.length;
  const max = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < max; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

function secret(): string | null {
  const value = process.env.STUDIO_SESSION_SECRET;
  return value && value.length > 0 ? value : null;
}

async function sign(payload: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * True only if `input` matches STUDIO_PASSWORD.
 *
 * Fails CLOSED when the env var is missing or empty: an unconfigured deploy
 * lets nobody in, rather than letting everybody in.
 */
export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.STUDIO_PASSWORD;
  if (!expected || expected.length === 0) return false;
  return timingSafeEqual(input, expected);
}

/** Issues a cookie value of the form `<expiry-ms>.<hmac>`. */
export async function createSessionToken(): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  return `${expiresAt}.${await sign(expiresAt, key)}`;
}

/** Verifies signature first, then expiry. Any malformed input is just false. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const key = secret();
  if (!key) return false;

  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!timingSafeEqual(signature, await sign(payload, key))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

/** Reports which env vars are missing, for the login page's setup warning. */
export function missingAuthConfig(): string[] {
  const missing: string[] = [];
  if (!process.env.STUDIO_PASSWORD) missing.push('STUDIO_PASSWORD');
  if (!process.env.STUDIO_SESSION_SECRET) missing.push('STUDIO_SESSION_SECRET');
  return missing;
}
