import type { Metadata } from 'next';

import './globals.css';
import WalletProvider from '@/components/WalletProvider';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'JStack App',
  description: 'Created using JStack',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');
  return (
    <html lang="en">
      <body className="antialiased">
        <WalletProvider cookies={cookies}>{children}</WalletProvider>
      </body>
    </html>
  );
}
