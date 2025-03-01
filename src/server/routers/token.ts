import { SignJWT } from 'jose';
import { authProcedure, j } from '../jstack';
// This is a public procedure that generates a JWT token for the user
export const tokenRouter = j.router({
  getPlayerToken: authProcedure.get(async ({ ctx, c }) => {
    const secretKey = new TextEncoder().encode(c.env.JWT_SECRET);

    const token = await new SignJWT({ walletAddress: ctx.user.address })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secretKey);

    return c.superjson({ token });
  }),
});
