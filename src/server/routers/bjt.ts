import { generateRandomString } from '@/atoms/atom';
import { TOKEN_ABI, TOKEN_ADDRESS } from '@/web3/constants';
import { eq } from 'drizzle-orm';
import {
  http,
  createPublicClient,
  createWalletClient,
  parseEther,
  parseUnits,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { huddle01Testnet } from 'viem/chains';
import { FaucetEntries } from '../db/schema';
import { authProcedure, j } from '../jstack';

const getClients = (faucetKey: string) => {
  if (faucetKey === '') {
    throw new Error('Operator private key is empty, Set ENV Vars');
  }
  const faucetAccount = privateKeyToAccount(faucetKey as `0x${string}`);

  const walletClient = createWalletClient({
    chain: huddle01Testnet, // Use your chain configuration
    transport: http(),
    account: faucetAccount,
  });

  const publicClient = createPublicClient({
    chain: huddle01Testnet,
    transport: http(),
  });

  return { walletClient, publicClient };
};

const FAUCET_AMOUNT_BJT = '5000';
const FAUCET_AMOUNT_ETH = '0.001';

export const bjtRouter = j.router({
  getBjtTokens: authProcedure.query(async ({ ctx, c }) => {
    const { address } = ctx.user;

    const { walletClient, publicClient } = getClients(c.env.FAUCET_PRIVATE_KEY);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now);
    twentyFourHoursAgo.setDate(now.getDate() - 1);

    const lastFaucetEntry = await ctx.db.query.FaucetEntries.findFirst({
      where: eq(FaucetEntries.walletAddress, address),
      orderBy: (faucetEntries, { desc }) => [desc(faucetEntries.date)],
    });

    if (
      lastFaucetEntry &&
      new Date(lastFaucetEntry.date) > twentyFourHoursAgo
    ) {
      const timeRemaining = new Date(lastFaucetEntry.date);
      timeRemaining.setDate(timeRemaining.getDate() + 1);
      return c.superjson({
        success: false,
        message: `Faucet available after ${timeRemaining.toLocaleTimeString()}, please wait for 24 hours after your last request.`,
      });
    }

    const decimals = await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: 'decimals',
    });

    try {
      const parsedBJTAmount = parseUnits(FAUCET_AMOUNT_BJT, decimals);
      const bjtTokenHash = await walletClient.writeContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'transfer',
        args: [address as `0x${string}`, parsedBJTAmount],
      });

      const userBalance = await publicClient.getBalance({
        address: address as `0x${string}`,
      });

      if (userBalance <= parseEther('0.001')) {
        const ethHash = await walletClient.sendTransaction({
          to: address as `0x${string}`,
          value: parseEther(FAUCET_AMOUNT_ETH),
        });

        await publicClient.waitForTransactionReceipt({ hash: ethHash });
      }

      await publicClient.waitForTransactionReceipt({ hash: bjtTokenHash });

      await ctx.db.insert(FaucetEntries).values([
        {
          id: generateRandomString(10),
          walletAddress: address,
          amount: Number(FAUCET_AMOUNT_BJT),
          date: new Date().toISOString(),
        },
      ]);

      return c.superjson({
        success: true,
        message: `Successfully transferred ${FAUCET_AMOUNT_BJT} tokens to ${address}`,
        hash: bjtTokenHash,
      });
    } catch (error) {
      console.error('Faucet error:', error);
      return c.superjson({
        success: false,
        message: 'Failed to get tokens from faucet.',
      });
    }
  }),
});
