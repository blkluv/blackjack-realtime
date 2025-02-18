import { SignJWT } from 'jose';
import { z } from 'zod';
import { j, publicProcedure } from '../jstack';
// This is a public procedure that generates a JWT token for the user
export const tokenRouter = j.router({
  getPlayerToken: publicProcedure
    .input(
      z.object({
        walletAddress: z.string().toLowerCase(),
      }),
    )
    .get(async ({ ctx, c, input }) => {
      const secretKey = new TextEncoder().encode(c.env.JWT_SECRET);

      const token = await new SignJWT({ walletAddress: input.walletAddress })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secretKey);

      return c.superjson({ token });
    }),
});
