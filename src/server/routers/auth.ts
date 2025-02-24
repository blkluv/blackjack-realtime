import { generateRandomString } from '@/atoms/atom';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { verifyMessage } from 'viem';
import { z } from 'zod';
import { ChallengeStore } from '../db/schema';
import { j, publicProcedure } from '../jstack';
import { constructMessage, generateNonce } from '../utils/web3';

export const authRouter = j.router({
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

      const existingMessage = await ctx.db.query.ChallengeStore.findFirst({
        where: eq(ChallengeStore.walletAddress, input.walletAddress),
      });

      if (existingMessage) {
        await ctx.db
          .update(ChallengeStore)
          .set({
            issuedAt: issuedAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            nonce,
          })
          .where(eq(ChallengeStore.walletAddress, input.walletAddress));

        const message = constructMessage({
          walletAddress: input.walletAddress,
          issuedAt,
          expiresAt,
          nonce,
        });

        return c.superjson(message);
      }

      await ctx.db.insert(ChallengeStore).values([
        {
          id: generateRandomString(10),
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
      const { walletAddress: address, signature } = input;

      try {
        const walletAddress = address.toLowerCase();

        const challengeData = await ctx.db.query.ChallengeStore.findFirst({
          where: (ChallengeStore, { eq }) =>
            eq(ChallengeStore.walletAddress, walletAddress),
        });

        if (!challengeData) {
          throw new Error('Challenge not found.');
        }

        const message = constructMessage({
          walletAddress: challengeData.walletAddress,
          issuedAt: new Date(challengeData.issuedAt),
          expiresAt: new Date(challengeData.expiresAt),
          nonce: challengeData.nonce,
        });

        const isVerfied = await verifyMessage({
          address: walletAddress as `0x${string}`,
          message,
          signature: signature as `0x${string}`,
        });

        if (!isVerfied) throw new Error('Signature verification failed.');

        await ctx.db
          .delete(ChallengeStore)
          .where(eq(ChallengeStore.walletAddress, walletAddress));

        const secretKey = new TextEncoder().encode(c.env.JWT_SECRET);
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
