import { env } from '@/env.mjs';
import { AccessToken, Role } from '@huddle01/server-sdk/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const roomId = searchParams.get('roomId');

  const walletAddress = searchParams.get('walletAddress');

  if (!roomId) {
    return new Response('Missing roomId', { status: 400 });
  }

  const accessToken = new AccessToken({
    apiKey: env.HUDDLE01_API_KEY,
    roomId: roomId as string,
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
    options: {
      metadata: {
        walletAddress,
      },
    },
  });

  //   console.log(accessToken);

  const token = await accessToken.toJwt();

  return NextResponse.json({ token });
}
