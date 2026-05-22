import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Playfair_Display } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'LegacyLink Admin',
  description: 'Manage memorial profiles and QR plaques',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
