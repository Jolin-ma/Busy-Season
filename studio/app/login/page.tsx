import { missingAuthConfig } from '@/lib/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const missing = missingAuthConfig();

  return (
    <main className="login-wrap">
      <div className="login-card">
        <span className="wordmark">
          LegacyLink <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>Studio</em>
        </span>
        <p className="muted" style={{ marginTop: 0, fontSize: '0.9375rem' }}>
          Back office
        </p>

        {missing.length > 0 && (
          <div className="notice notice-bad" style={{ marginBottom: '1.25rem' }}>
            <strong>Not configured.</strong> {missing.join(' and ')}{' '}
            {missing.length > 1 ? 'are' : 'is'} not set, so sign-in will always fail. Add{' '}
            {missing.length > 1 ? 'them' : 'it'} to <code>studio/.env</code> locally, or to the
            Vercel project in production.
          </div>
        )}

        {error && (
          <div className="notice notice-bad" style={{ marginBottom: '1.25rem' }}>
            That password didn&apos;t work.
          </div>
        )}

        <form className="card card-pad" action="/api/auth/login" method="post">
          <input type="hidden" name="next" value={next ?? '/'} />
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
