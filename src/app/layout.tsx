import type { Metadata } from 'next';

import './globals.css';
import { WalletProvider } from '@/components/auth/WalletProvider';

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
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
