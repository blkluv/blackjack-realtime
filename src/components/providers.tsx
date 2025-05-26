'use client';
import { env } from '@/env.mjs';
import { HuddleClient, HuddleProvider } from '@huddle01/react';
import { huddle01Testnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import { QueryCache } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HTTPException } from 'hono/http-exception';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { type Config, WagmiProvider, cookieToInitialState } from 'wagmi';
import { config, siweConfig, wagmiAdapter } from './auth/config';
import { Toaster } from './ui/sonner';
// Set up metadata
const metadata = {
  name: 'Blackjack',
  description: 'A on-chain blackjack game, earn $ETH by playing!',
  url:
    env.NODE_ENV === 'production'
      ? 'https://deckdash.arcy.in'
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

const huddleClient = new HuddleClient({
  projectId: env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID,
  options: {
    activeSpeakers: {
      size: 8,
    },
  },
});

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
      <WagmiProvider config={config} initialState={initialState}>
        <QueryClientProvider client={queryClient}>
          <HuddleProvider client={huddleClient}>
            {children}
            {/* increase text size */}
            <Toaster richColors position="bottom-left" duration={5000} />
          </HuddleProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
};
