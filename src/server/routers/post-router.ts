import { z } from 'zod';
import { j, publicProcedure } from '../jstack';
import { generateNonce, constructMessage } from '../utils/web3';

export const postRouter = j.router({
  generateChallenge: publicProcedure
    .input(z.object({ walletAddress: z.string().toLowerCase() }))
    .mutation(async ({ input }) => {
      const now = Date.now();
      const issuedAt = new Date(now);

      const expiresAt = new Date(now + 5 * 60 * 1000);

      const nonce = await generateNonce();

      const message = constructMessage({
        walletAddress: input.walletAddress,
        issuedAt,
        expiresAt,
        nonce,
      });

      return message;
    }),
});
