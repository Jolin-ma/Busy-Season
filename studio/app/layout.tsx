import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Studio Back Office',
  // Internal tool. Keep it out of search results even if the URL leaks.
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The topbar is nav for a signed-in session, so it renders only when there is
  // one. Middleware still does the actual gating — this is presentation only.
  const signedIn = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);

  return (
    <html lang="en">
      <body>
        {signedIn && (
          <header className="topbar">
            <div className="topbar-inner">
              <a href="/" className="wordmark">
                LegacyLink <em>Studio</em>
              </a>
              <nav>
                <a href="/">Clients</a>
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="btn btn-danger"
                    style={{ color: 'rgba(242,242,240,0.75)' }}
                  >
                    Sign out
                  </button>
                </form>
              </nav>
            </div>
          </header>
        )}
        {signedIn ? <div className="shell">{children}</div> : children}
      </body>
    </html>
  );
}
