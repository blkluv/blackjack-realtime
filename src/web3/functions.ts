import {
  http,
  createPublicClient,
  createWalletClient,
  formatUnits,
  parseUnits,
} from 'viem';
import { huddle01Testnet } from 'viem/chains';
import {
  TOKEN_ABI,
  TOKEN_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
} from './constants';

// Create public client
const publicClient = createPublicClient({
  chain: huddle01Testnet,
  transport: http(),
});

// Create wallet client with browser wallet support
const walletClient = createWalletClient({
  chain: huddle01Testnet,
  //@ts-ignore
  transport: http(), // Using user's wallet provider
});

/**
 * Get token decimals from the contract
 */
export async function getTokenDecimals(): Promise<number> {
  try {
    const decimals = await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: 'decimals',
    });
    return decimals;
  } catch (error) {
    console.error('Error getting token decimals:', error);
    return 18; // Default to 18 if we can't get the value
  }
}

/**
 * Get user's token balance
 */
export async function getTokenBalance(
  address: `0x${string}`,
): Promise<{ raw: bigint; formatted: string }> {
  try {
    const balance = await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: 'balanceOf',
      args: [address],
    });

    const decimals = await getTokenDecimals();
    const formatted = formatUnits(balance, decimals);

    return { raw: balance, formatted };
  } catch (error) {
    console.error('Error getting token balance:', error);
    return { raw: BigInt(0), formatted: '0' };
  }
}

/**
 * Get user's balance in the vault contract
 */
export async function getVaultBalance(
  address: `0x${string}`,
): Promise<{ raw: bigint; formatted: string }> {
  try {
    const balance = await publicClient.readContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'getBalance',
      args: [address],
    });

    const decimals = await getTokenDecimals();
    const formatted = formatUnits(balance, decimals);

    return { raw: balance, formatted };
  } catch (error) {
    console.error('Error getting vault balance:', error);
    return { raw: BigInt(0), formatted: '0' };
  }
}

/**
 * Approve tokens for the vault contract to spend
 */
export async function approveTokens(
  amount: string,
): Promise<{ success: boolean; hash?: `0x${string}`; error?: unknown }> {
  try {
    // Get user's address
    const [address] = await walletClient.getAddresses();
    if (!address) throw new Error('No wallet address found');
    // Convert amount to token units
    const decimals = await getTokenDecimals();
    const amountInTokenUnits = parseUnits(amount, decimals);

    // Check if user has enough tokens
    const { raw: userBalance } = await getTokenBalance(address);
    if (userBalance < amountInTokenUnits) {
      return {
        success: false,
        error: `Insufficient token balance. You have ${formatUnits(userBalance, decimals)} tokens.`,
      };
    }

    // Approve spending
    const hash = await walletClient.writeContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: 'approve',
      args: [VAULT_ADDRESS, amountInTokenUnits],
      account: address,
    });

    console.log('Approval transaction hash:', hash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Approval confirmed:', receipt);

    return { success: true, hash };
  } catch (error) {
    console.error('Error approving tokens:', error);
    return { success: false, error };
  }
}

/**
 * Deposit tokens into the vault contract
 */
export async function depositTokens(
  amount: string,
): Promise<{ success: boolean; hash?: `0x${string}`; error?: unknown }> {
  try {
    // Get user's address
    const [address] = await walletClient.getAddresses();
    if (!address) throw new Error('No wallet address found');

    // Convert amount to token units
    const decimals = await getTokenDecimals();
    const amountInTokenUnits = parseUnits(amount, decimals);

    // Deposit tokens
    const hash = await walletClient.writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'deposit',
      args: [amountInTokenUnits],
      account: address,
    });

    console.log('Deposit transaction hash:', hash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Deposit confirmed:', receipt);

    return { success: true, hash };
  } catch (error) {
    console.error('Error depositing tokens:', error);
    return { success: false, error };
  }
}

/**
 * Withdraw tokens from the vault contract
 */
export async function withdrawTokens(
  amount: string,
): Promise<{ success: boolean; hash?: `0x${string}`; error?: unknown }> {
  try {
    // Get user's address
    const [address] = await walletClient.getAddresses();
    if (!address) throw new Error('No wallet address found');

    // Convert amount to token units
    const decimals = await getTokenDecimals();
    const amountInTokenUnits = parseUnits(amount, decimals);

    // Check if user has enough balance in vault
    const { raw: vaultBalance } = await getVaultBalance(address);
    if (vaultBalance < amountInTokenUnits) {
      return {
        success: false,
        error: `Insufficient vault balance. You have ${formatUnits(vaultBalance, decimals)} tokens in the game vault.`,
      };
    }

    // Withdraw tokens
    const hash = await walletClient.writeContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: 'withdraw',
      args: [amountInTokenUnits],
      account: address,
    });

    console.log('Withdrawal transaction hash:', hash);

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Withdrawal confirmed:', receipt);

    return { success: true, hash };
  } catch (error) {
    console.error('Error withdrawing tokens:', error);
    return { success: false, error };
  }
}

/**
 * Complete deposit flow: approve + deposit
 */
export async function handleDeposit(
  amount: string,
): Promise<{ success: boolean; message: string; hash?: `0x${string}` }> {
  // Step 1: Approve the tokens
  const approvalResult = await approveTokens(amount);
  if (!approvalResult.success) {
    return {
      success: false,
      message:
        typeof approvalResult.error === 'string'
          ? approvalResult.error
          : 'Failed to approve tokens. Please check your balance and try again.',
    };
  }

  // Step 2: Deposit the tokens
  const depositResult = await depositTokens(amount);
  if (!depositResult.success) {
    return {
      success: false,
      message:
        typeof depositResult.error === 'string'
          ? depositResult.error
          : 'Failed to deposit tokens. The approval was successful, but the deposit failed.',
    };
  }

  // Successfully deposited tokens
  return {
    success: true,
    message: `Successfully deposited ${amount} tokens!`,
    hash: depositResult.hash,
  };
}

/**
 * Get all balances in one call
 */
export async function getAllBalances(address?: `0x${string}`): Promise<{
  tokenBalance: string;
  vaultBalance: string;
}> {
  try {
    // If no address provided, get it from wallet
    let userAddress: `0x${string}`;
    if (!address) {
      const [walletAddress] = await walletClient.getAddresses();
      if (!walletAddress) throw new Error('No wallet address found');
      userAddress = walletAddress;
    } else {
      userAddress = address;
    }

    const tokenBalance = await getTokenBalance(userAddress);
    const vaultBalance = await getVaultBalance(userAddress);

    return {
      tokenBalance: tokenBalance.formatted,
      vaultBalance: vaultBalance.formatted,
    };
  } catch (error) {
    console.error('Error fetching balances:', error);
    return {
      tokenBalance: '0',
      vaultBalance: '0',
    };
  }
}
