import { env } from '@/env.mjs';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createSIWEConfig, formatMessage } from '@reown/appkit-siwe';
import type {
  SIWECreateMessageArgs,
  SIWESession,
  SIWEVerifyMessageArgs,
} from '@reown/appkit-siwe';
import { arbitrum, mainnet, sepolia } from '@reown/appkit/networks';
import { cookieStorage, createStorage } from '@wagmi/core';
import { getCsrfToken, getSession, signIn, signOut } from 'next-auth/react';

// Get projectId from https://cloud.reown.com
const projectId = env.NEXT_PUBLIC_PROJECT_ID;

export const networks = [mainnet, arbitrum];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;

export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== 'undefined' ? window.location.host : '',
    uri: typeof window !== 'undefined' ? window.location.origin : '',
    chains: [mainnet.id, sepolia.id, arbitrum.id],
    statement: 'Please sign with your account',
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) =>
    formatMessage(args, address),
  getNonce: async () => {
    const nonce = await getCsrfToken();
    if (!nonce) {
      throw new Error('Failed to get nonce!');
    }

    return nonce;
  },
  getSession: async () => {
    const session = await getSession();
    if (!session) {
      return null;
    }

    // Validate address and chainId types
    if (
      typeof session.address !== 'string' ||
      typeof session.chainId !== 'number'
    ) {
      return null;
    }

    return {
      address: session.address,
      chainId: session.chainId,
    } satisfies SIWESession;
  },
  verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
    try {
      const success = await signIn('credentials', {
        message,
        redirect: false,
        signature,
      });

      return Boolean(success?.ok);
    } catch (error) {
      return false;
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: false,
      });

      return true;
    } catch (error) {
      return false;
    }
  },
});
