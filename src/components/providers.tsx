'use client';
import { env } from '@/env.mjs';
import { createAppKit } from '@reown/appkit/react';
import { QueryCache } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HTTPException } from 'hono/http-exception';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { huddle01Testnet } from 'viem/chains';
import { type Config, WagmiProvider, cookieToInitialState } from 'wagmi';
import { siweConfig, wagmiAdapter } from './auth/config';

// Set up metadata
const metadata = {
  name: 'Blackjack',
  description: 'A on-chain blackjack game, earn $ETH by playing!',
  url:
    env.NODE_ENV === 'production'
      ? 'https://blackjack.arcy.in'
      : 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId: env.NEXT_PUBLIC_PROJECT_ID,
  networks: [huddle01Testnet],
  defaultNetwork: huddle01Testnet,
  metadata: metadata,
  siweConfig: siweConfig,
  features: {
    analytics: false, // Optional - defaults to your Cloud configuration
  },
});

type Props = {
  children: React.ReactNode;
  cookies?: string;
};

export const Providers = ({ children, cookies }: Props) => {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  );
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (err) => {
            if (err instanceof HTTPException) {
              // global error handling, e.g. toast notification ...
            }
          },
        }),
      }),
  );

  return (
    <SessionProvider>
      <WagmiProvider
        config={wagmiAdapter.wagmiConfig as Config}
        initialState={initialState}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
};
