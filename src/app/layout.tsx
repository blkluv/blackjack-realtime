import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/theme';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://blkjack.atl5d.com'),
  title: 'Deckdash',
  description:
    'Play blackjack with your friends, family, or strangers.',
  twitter: {
    card: 'summary_large_image',
    site: '@atl5d',
    creator: '@atl5d',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" forcedTheme="dark">
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
