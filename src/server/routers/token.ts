import { AccessToken, Role } from '@huddle01/server-sdk/auth';
import { SignJWT } from 'jose';
import { authProcedure, j, publicProcedure } from '../jstack';

export const tokenRouter = j.router({
  getPlayerToken: authProcedure.get(async ({ ctx, c }) => {
    const secretKey = new TextEncoder().encode(c.env.JWT_SECRET);

    const token = await new SignJWT({ walletAddress: ctx.user.address })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secretKey);

    return c.superjson({ token });
  }),
  getHuddleToken: publicProcedure.get(async ({ ctx, input, c }) => {
    const accessToken = new AccessToken({
      apiKey: c.env.HUDDLE01_API_KEY,
      roomId: c.env.NEXT_PUBLIC_HUDDLE01_ROOM_ID,
      role: Role.HOST,
      permissions: {
        admin: true,
        canConsume: true,
        canProduce: true,
        canProduceSources: {
          cam: true,
          mic: true,
          screen: true,
        },
        canRecvData: true,
        canSendData: true,
        canUpdateMetadata: true,
      },
    });

    const token = await accessToken.toJwt();

    return c.superjson({ token });
  }),
});
