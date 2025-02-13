import { env } from '@/env.mjs';
import { SignJWT } from 'jose';
import { type Address, verifyMessage } from 'viem';
import { z } from 'zod';
import { j, publicProcedure } from '../jstack';
import { constructMessage, generateNonce } from '../utils/web3';

export const postRouter = j.router({
  generateChallenge: publicProcedure
    .input(z.object({ walletAddress: z.string().toLowerCase() }))
    .get(async ({ ctx, c, input }) => {
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

      return c.superjson(message);
    }),
  // verify challenge and return a signed jwt for cookie
  verifyChallenge: publicProcedure
    .input(
      z.object({
        walletAddress: z.string().toLowerCase(),
        signature: z.string(),
      }),
    )
    .get(async ({ ctx, c, input }) => {
      const { walletAddress, signature } = input;

      try {
        const isValidSignature = await verifyMessage({
          address: walletAddress as Address,
          message: env.NEXT_PUBLIC_SIGN_MSG,
          signature: signature as Address,
        });

        if (!isValidSignature) {
          return c.superjson({ message: 'Invalid signature' }, 401); // 401 Unauthorized
        }

        const secretKey = new TextEncoder().encode(env.JWT_SECRET);
        const token = await new SignJWT({ walletAddress })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('24h')
          .sign(secretKey);

        return c.superjson({ token }); // Return the JWT in the response
      } catch (error) {
        console.error('Error verifying signature or generating JWT:', error);
        return c.superjson(
          { message: 'Verification failed or JWT generation error' },
          500,
        ); // 500 Internal Server Error
      }
    }),
});
