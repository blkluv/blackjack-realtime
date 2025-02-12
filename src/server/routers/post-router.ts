import { env } from '@/env.mjs';
import jwt from 'jsonwebtoken';
import { type Address, verifyMessage } from 'viem';
import { z } from 'zod';
import { j, publicProcedure } from '../jstack';
import { constructMessage, generateNonce } from '../utils/web3';

const JWT_SECRET = env.JWT_SECRET;

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
        message: z.string(),
      }),
    )
    .get(async ({ ctx, c, input }) => {
      const { walletAddress, signature, message } = input;

      try {
        const isValidSignature = await verifyMessage({
          address: walletAddress as Address,
          message: message,
          signature: signature as Address,
        });

        if (!isValidSignature) {
          return c.superjson({ message: 'Invalid signature' }, 401); // 401 Unauthorized
        }

        // Signature is valid, generate JWT
        const jwtPayload = {
          walletAddress: walletAddress,

          // You can add other relevant user data to the payload here, but keep it minimal
        };

        const token = jwt.sign(jwtPayload, JWT_SECRET, {
          expiresIn: '24h',
        });

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
