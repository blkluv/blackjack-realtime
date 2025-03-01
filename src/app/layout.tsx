import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/theme';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://blackjack.arcy.in'),
  title: 'Deckdash',
  description:
    'Play blackjack with your friends, family, or strangers. Powered by Huddle01.',
  twitter: {
    card: 'summary_large_image',
    site: '@huddle01com',
    creator: '@huddle01com',
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
          <Providers>
            {children}
            {/* <Sound /> */}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
