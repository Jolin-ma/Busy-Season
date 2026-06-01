import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const geist    = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', style: ['normal', 'italic'] });

export const metadata: Metadata = {
  title: 'LegacyLink · Ops Dashboard',
  description: 'Internal operations, analytics, and QR manufacturing dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} h-full`}>
      <body className="h-full antialiased font-[family-name:var(--font-geist-sans)]">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
