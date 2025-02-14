'use server';

import { client } from './client';

export const verifyUserAction = async (
  signature: string,
  walletAddress: string,
) => {
  const response = await client.auth.verifyChallenge.$get({
    signature,
    walletAddress,
  });
  if (!response.ok) throw new Error('Authentication failed');
  return await response.json();
};
