import type { Metadata, Viewport } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Suspense, type ReactNode } from 'react';
import { Beacon } from '@/components/Beacon';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SITE_DESCRIPTION as DESCRIPTION } from '@/lib/server/metadata';
import { THEME_SCRIPT } from '@/lib/theme/script';
import '@/styles/index.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://nomo.md'),
  title: 'Nomo',
  description: DESCRIPTION,
  icons: { icon: [{ url: '/nomo.svg?v=2', type: 'image/svg+xml' }], shortcut: '/nomo.svg?v=2', apple: '/nomo.png' },
  openGraph: { type: 'website', siteName: 'Nomo', url: 'https://nomo.md', title: 'Nomo', description: DESCRIPTION, images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Nomo' }] },
  twitter: { card: 'summary_large_image', title: 'Nomo', description: DESCRIPTION, images: ['/og.png'] },
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#ffffff' }, { media: '(prefers-color-scheme: dark)', color: '#111111' }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
    </head>
    <body>
      <main className="app-shell" data-layout="portfolio">
        {children}
        <ThemeToggle />
      </main>
      <Suspense fallback={null}><Beacon /></Suspense>
    </body>
  </html>;
}
