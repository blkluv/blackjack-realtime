import { triggerBalanceRefreshAtom } from '@/atoms/blackjack.atom';
import { useAtomValue } from 'jotai';
// hooks/useVault.ts
import { useCallback, useEffect, useState } from 'react';
import {
  http,
  type WalletClient,
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  parseUnits,
} from 'viem';
import { huddle01Testnet } from 'viem/chains';
import {
  TOKEN_ABI,
  TOKEN_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
} from '../web3/constants';

// Types
interface VaultBalances {
  tokenBalance: string;
  vaultBalance: string;
  rawTokenBalance: bigint;
  rawVaultBalance: bigint;
}

interface TransactionState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  hash: `0x${string}` | null;
}

interface UseVaultReturn {
  address: `0x${string}` | null;

  // Balance state
  balances: VaultBalances;
  refreshBalances: () => Promise<void>;

  // Transaction state
  transaction: TransactionState;
  resetTransactionState: () => void;

  // Actions
  deposit: (amount: string) => Promise<void>;
  withdraw: (amount: string) => Promise<void>;
  approveTokens: (amount: string) => Promise<boolean>;
}

// Create public client
const publicClient = createPublicClient({
  chain: huddle01Testnet,
  transport: http(),
});

export function useVault(): UseVaultReturn {
  // State hooks
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const triggerBalanceRefresh = useAtomValue(triggerBalanceRefreshAtom);
  const [balances, setBalances] = useState<VaultBalances>({
    tokenBalance: '0',
    vaultBalance: '0',
    rawTokenBalance: BigInt(0),
    rawVaultBalance: BigInt(0),
  });
  const [transaction, setTransaction] = useState<TransactionState>({
    isLoading: false,
    error: null,
    success: false,
    hash: null,
  });

  // Initialize wallet client
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const client = createWalletClient({
      chain: huddle01Testnet,
      //@ts-ignore
      transport: custom(window.ethereum),
    });

    client.getAddresses().then(([walletAddress]) => {
      if (walletAddress) {
        setAddress(walletAddress);
      }
    });

    setWalletClient(client);
  }, []);

  // Fetch balances when address changes
  useEffect(() => {
    if (address) {
      refreshBalances();
    }
  }, [address, triggerBalanceRefresh]);

  // Get token decimals
  const getTokenDecimals = useCallback(async (): Promise<number> => {
    try {
      const decimals = await publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'decimals',
      });
      return decimals;
    } catch (error) {
      console.error('Error getting token decimals:', error);
      return 18;
    }
  }, []);

  // Refresh balances
  const refreshBalances = useCallback(async (): Promise<void> => {
    if (!address) return;

    try {
      const decimals = await getTokenDecimals();

      const tokenBalance = await publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'balanceOf',
        args: [address],
      });

      const vaultBalance = await publicClient.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: 'getBalance',
        args: [address],
      });

      // if(balances.vaultBalance>vaultBalance){
      //aler(-200 dolare lost ,)
      // turn component red
      // }
      // if(balances.vaultBalance<vaultBalance){
      //aler(+200 dolare added ,)
      // turn component green
      // }


      setBalances({
        tokenBalance: formatUnits(tokenBalance, decimals),
        vaultBalance: formatUnits(vaultBalance, decimals),
        rawTokenBalance: tokenBalance,
        rawVaultBalance: vaultBalance,
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [address, getTokenDecimals]);

  // Reset transaction state
  const resetTransactionState = useCallback((): void => {
    setTransaction({
      isLoading: false,
      error: null,
      success: false,
      hash: null,
    });
  }, []);

  // Approve tokens
  const approveTokens = useCallback(
    async (amount: string): Promise<boolean> => {
      if (!walletClient || !address) return false;

      setTransaction({
        isLoading: true,
        error: null,
        success: false,
        hash: null,
      });

      try {
        const decimals = await getTokenDecimals();
        const amountInTokenUnits = parseUnits(amount, decimals);

        // Check if user has enough tokens
        if (amountInTokenUnits > balances.rawTokenBalance) {
          setTransaction({
            isLoading: false,
            error: `Insufficient token balance. You have ${balances.tokenBalance} tokens.`,
            success: false,
            hash: null,
          });
          return false;
        }

        // Approve spending
        const hash = await walletClient.writeContract({
          address: TOKEN_ADDRESS,
          abi: TOKEN_ABI,
          functionName: 'approve',
          args: [VAULT_ADDRESS, amountInTokenUnits],
          account: address,
          chain: huddle01Testnet,
        });

        setTransaction({
          isLoading: true,
          error: null,
          success: false,
          hash,
        });

        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash });

        setTransaction({
          isLoading: false,
          error: null,
          success: true,
          hash,
        });

        return true;
      } catch (error) {
        console.error('Error approving tokens:', error);
        setTransaction({
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Failed to approve tokens',
          success: false,
          hash: null,
        });

        return false;
      }
    },
    [walletClient, address, getTokenDecimals, balances],
  );

  // Deposit tokens
  const deposit = useCallback(
    async (amount: string): Promise<void> => {
      if (!walletClient || !address) {
        setTransaction({
          isLoading: false,
          error: 'Wallet not connected',
          success: false,
          hash: null,
        });
        return;
      }

      if (Number(amount) % 1 !== 0) {
        console.error('Amount must be a whole number');
        return;
      }

      // First approve tokens
      const approved = await approveTokens(amount);
      if (!approved) return;

      setTransaction({
        isLoading: true,
        error: null,
        success: false,
        hash: null,
      });

      try {
        const decimals = await getTokenDecimals();
        const amountInTokenUnits = parseUnits(amount, decimals);

        // Deposit tokens
        const hash = await walletClient.writeContract({
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: 'deposit',
          args: [amountInTokenUnits],
          account: address,
          chain: huddle01Testnet,
        });

        setTransaction({
          isLoading: true,
          error: null,
          success: false,
          hash,
        });

        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash });

        setTransaction({
          isLoading: false,
          error: null,
          success: true,
          hash,
        });

        // Refresh balances
        await refreshBalances();
      } catch (error) {
        console.error('Error depositing tokens:', error);
        setTransaction({
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Failed to deposit tokens',
          success: false,
          hash: null,
        });
      }
    },
    [walletClient, address, approveTokens, getTokenDecimals, refreshBalances],
  );

  // Withdraw tokens
  const withdraw = useCallback(
    async (amount: string): Promise<void> => {
      if (!walletClient || !address) {
        setTransaction({
          isLoading: false,
          error: 'Wallet not connected',
          success: false,
          hash: null,
        });
        return;
      }

      if (Number(amount) % 1 !== 0) {
        console.error('Amount must be a whole number');
        return;
      }

      setTransaction({
        isLoading: true,
        error: null,
        success: false,
        hash: null,
      });

      try {
        const decimals = await getTokenDecimals();
        const amountInTokenUnits = parseUnits(amount, decimals);

        // Check if user has enough balance in vault
        if (amountInTokenUnits > balances.rawVaultBalance) {
          setTransaction({
            isLoading: false,
            error: `Insufficient vault balance. You have ${balances.vaultBalance} tokens in the game vault.`,
            success: false,
            hash: null,
          });
          return;
        }

        // Withdraw tokens
        const hash = await walletClient.writeContract({
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: 'withdraw',
          args: [amountInTokenUnits],
          account: address,
          chain: huddle01Testnet,
        });

        setTransaction({
          isLoading: true,
          error: null,
          success: false,
          hash,
        });

        // Wait for transaction confirmation
        await publicClient.waitForTransactionReceipt({ hash });

        setTransaction({
          isLoading: false,
          error: null,
          success: true,
          hash,
        });

        // Refresh balances
        await refreshBalances();
      } catch (error) {
        console.error('Error withdrawing tokens:', error);
        setTransaction({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to withdraw tokens',
          success: false,
          hash: null,
        });
      }
    },
    [walletClient, address, getTokenDecimals, balances, refreshBalances],
  );

  return {
    address,

    // Balance state
    balances,
    refreshBalances,

    // Transaction state
    transaction,
    resetTransactionState,

    // Actions
    deposit,
    withdraw,
    approveTokens,
  };
}
