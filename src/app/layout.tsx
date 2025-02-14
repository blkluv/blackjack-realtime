import type { Metadata } from 'next';

import './globals.css';
// import { Providers } from '@/components/providers';
import { Web3Provider } from '@/components/auth/Web3Provider';

export const metadata: Metadata = {
  title: 'JStack App',
  description: 'Created using JStack',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
