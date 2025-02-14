import { env } from '@/env.mjs';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { type Address, verifyMessage } from 'viem';
import { z } from 'zod';
import { challengeStore } from '../db/schema';
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

      const existingMessage = await ctx.db.query.challengeStore.findFirst({
        where: eq(challengeStore.walletAddress, input.walletAddress),
      });

      if (existingMessage) {
        await ctx.db
          .update(challengeStore)
          .set({
            issuedAt: issuedAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            nonce,
          })
          .where(eq(challengeStore.walletAddress, input.walletAddress));

        const message = constructMessage({
          walletAddress: input.walletAddress,
          issuedAt,
          expiresAt,
          nonce,
        });

        return message;
      }

      await ctx.db.insert(challengeStore).values([
        {
          walletAddress: input.walletAddress,
          issuedAt: issuedAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          nonce,
        },
      ]);

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
        ctx.db
          .select({
            nonce: challengeStore.nonce,
          })
          .from(challengeStore)
          .where(eq(challengeStore.walletAddress, walletAddress));

        const isValidSignature = await verifyMessage({
          address: walletAddress as Address,
          message: nonce,
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
