import { CredentialsSignin } from '@auth/core/errors';
import Credentials from '@auth/core/providers/credentials';
import { z } from 'zod';
import { client } from '@/lib/client';

export class CustomCredsError extends CredentialsSignin {
  code = 'CustomCredsError err';

  constructor(message: string) {
    super();
    this.code = message;
  }
}

const CredsSchema = z.object({
  address: z.custom<`0x${string}`>(),
  signature: z.custom<`0x${string}`>(),
});

const WalletProvider = Credentials({
  name: 'Ethereum Wallet Login',
  credentials: {
    address: { label: 'Wallet Address', type: 'text' },
    signature: { label: 'Signature', type: 'text' },
  },
  authorize: async (credentials) => {
    try {
      const { address, signature } = await CredsSchema.parseAsync(credentials);

      const walletAddress = address.toLowerCase();

      const response = await client.auth.verifyChallenge.$get({
        signature,
        walletAddress,
      });

      const { token } = (await response.json()) as { token: string };

      return { id: walletAddress, email: token };
    } catch (error) {
      throw new CustomCredsError('Signature verification failed.');
    }
  },
});

export default WalletProvider;
