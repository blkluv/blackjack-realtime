import { env } from '@/env.mjs';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { j, authProcedure } from '../jstack';

// This is a public procedure that generates a JWT token for the user
export const tokenRouter = j.router({
  getPlayerToken: authProcedure
    .input(z.object({ walletAddress: z.string().toLowerCase() }))
    .get(async ({ c, input }) => {
      const secretKey = new TextEncoder().encode(env.JWT_SECRET);

      const token = await new SignJWT({ walletAddress: input.walletAddress })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secretKey);

      return c.superjson({ token });
    }),
});
