import { triggerBalanceRefreshAtom } from '@/atoms/blackjack.atom';
import { userAtom } from '@/atoms/user.atom';
import { config } from '@/components/auth/config';
import { simulateContract, writeContract } from '@wagmi/core';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
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
  balances: VaultBalances;
  refreshBalances: () => Promise<void>;
  transaction: TransactionState;
  resetTransactionState: () => void;
  deposit: (amount: string) => Promise<void>;
  withdraw: (amount: string) => Promise<void>;
  approveTokens: (amount: string) => Promise<boolean>;
}

export function useVault(): UseVaultReturn {
  // State hooks
  const { walletAddress: waddress } = useAtomValue(userAtom);
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

  // useReadContract hooks for fetching data
  const { data: tokenDecimals } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'decimals',
  });

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: waddress ? [waddress] : undefined,
  });

  const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: 'getBalance',
    args: waddress ? [waddress] : undefined,
  });

  // Single writeContract hook for all write operations
  const { writeContractAsync } = useWriteContract();

  // Update balances when data changes
  useEffect(() => {
    if (
      tokenBalance !== undefined &&
      vaultBalance !== undefined &&
      tokenDecimals !== undefined
    ) {
      const decimals = Number(tokenDecimals || 18);
      const fmtTokenBalance = formatUnits(tokenBalance, decimals);
      const fmtVaultBalance = formatUnits(vaultBalance, decimals);

      setBalances({
        tokenBalance: fmtTokenBalance,
        vaultBalance: fmtVaultBalance,
        rawTokenBalance: tokenBalance,
        rawVaultBalance: vaultBalance,
      });
    }
  }, [tokenBalance, vaultBalance, tokenDecimals]);

  // Fetch balances when address changes or refresh is triggered
  useEffect(() => {
    refreshBalances();
  }, [waddress, triggerBalanceRefresh]);

  // Consolidated refresh balances function
  const refreshBalances = useCallback(async (): Promise<void> => {
    if (!waddress) {
      return;
    }

    try {
      await Promise.all([refetchTokenBalance(), refetchVaultBalance()]);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [waddress, refetchTokenBalance, refetchVaultBalance]);

  // Reset transaction state
  const resetTransactionState = useCallback((): void => {
    setTransaction({
      isLoading: false,
      error: null,
      success: false,
      hash: null,
    });
  }, []);

  // Wait for transaction receipt
  const { data: txReceipt, isLoading: isTxLoading } =
    useWaitForTransactionReceipt({
      hash: transaction.hash ?? undefined,
    });

  // Update transaction state when receipt is received
  useEffect(() => {
    if (transaction.hash && txReceipt && !isTxLoading) {
      setTransaction((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
      }));
      refreshBalances();
    }
  }, [txReceipt, isTxLoading, transaction.hash, refreshBalances]);

  // Approve tokens
  const approveTokens = useCallback(
    async (amount: string): Promise<boolean> => {
      if (!waddress || !tokenDecimals) return false;

      setTransaction({
        isLoading: true,
        error: null,
        success: false,
        hash: null,
      });

      try {
        const decimals = Number(tokenDecimals || 18);
        const amountInTokenUnits = parseUnits(amount, decimals);

        // Check if user has enough tokens
        if (tokenBalance && amountInTokenUnits > tokenBalance) {
          setTransaction({
            isLoading: false,
            error: `Insufficient token balance. You have ${balances.tokenBalance} tokens.`,
            success: false,
            hash: null,
          });
          return false;
        }

        // Approve spending
        const { request } = await simulateContract(config, {
          address: TOKEN_ADDRESS,
          abi: TOKEN_ABI,
          functionName: 'approve',
          args: [VAULT_ADDRESS, amountInTokenUnits],
        });

        const hash = await writeContract(config, request);

        setTransaction({
          isLoading: true,
          error: null,
          success: false,
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
    [waddress, tokenDecimals, tokenBalance, balances, writeContractAsync],
  );

  // Deposit tokens
  const deposit = useCallback(
    async (amount: string): Promise<void> => {
      if (!waddress || !tokenDecimals) {
        setTransaction({
          isLoading: false,
          error: 'Wallet not connected or token decimals not available',
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
        const decimals = Number(tokenDecimals || 18);
        const amountInTokenUnits = parseUnits(amount, decimals);

        // Simulate transaction
        const { request } = await simulateContract(config, {
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: 'deposit',
          args: [amountInTokenUnits],
        });

        console.log(request.gas);

        // Deposit tokens
        const hash = await writeContract(config, request);

        setTransaction({
          isLoading: true,
          error: null,
          success: false,
          hash,
        });
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
    [waddress, tokenDecimals, approveTokens, writeContractAsync],
  );

  // Withdraw tokens
  const withdraw = useCallback(
    async (amount: string): Promise<void> => {
      if (!waddress || !tokenDecimals) {
        setTransaction({
          isLoading: false,
          error: 'Wallet not connected or token decimals not available',
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
        const decimals = Number(tokenDecimals || 18);
        const amountInTokenUnits = parseUnits(amount, decimals);

        // Check if user has enough balance in vault
        if (vaultBalance && amountInTokenUnits > vaultBalance) {
          setTransaction({
            isLoading: false,
            error: `Insufficient vault balance. You have ${balances.vaultBalance} tokens in the game vault.`,
            success: false,
            hash: null,
          });
          return;
        }

        // Simulate transaction
        const { request } = await simulateContract(config, {
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: 'withdraw',
          args: [amountInTokenUnits],
        });

        console.log(request.gas);

        // Withdraw tokens
        const hash = await writeContract(config, request);

        setTransaction({
          isLoading: true,
          error: null,
          success: false,
          hash,
        });
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
    [waddress, tokenDecimals, balances, vaultBalance, writeContractAsync],
  );

  return {
    address: waddress ?? null,
    balances,
    refreshBalances,
    transaction,
    resetTransactionState,
    deposit,
    withdraw,
    approveTokens,
  };
}
