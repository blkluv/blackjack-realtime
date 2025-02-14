import { env } from '@/env.mjs';
import { SignJWT } from 'jose';
import { j, publicProcedure } from '../jstack';

// This is a public procedure that generates a JWT token for the user
export const tokenRouter = j.router({
  getPlayerToken: publicProcedure.get(async ({ ctx, c }) => {
    const secretKey = new TextEncoder().encode(env.JWT_SECRET);

    const token = await new SignJWT({ walletAddress: 'abcd' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secretKey);

    return c.superjson({ token });
  }),
});
