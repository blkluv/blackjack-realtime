'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/hooks/useUser';
import {
  approveTokens,
  depositTokens,
  getTokenBalance,
  getVaultBalance,
  withdrawTokens,
} from '@/web3/functions';
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from '@reown/appkit/react';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const WalletConnect = () => {
  const { open } = useAppKit();
  const { user } = useUser();
  const { disconnect } = useDisconnect();
  const { address } = useAppKitAccount();
  const [bjtBalance, setBjtBalance] = useState<string>('0');
  const [vaultBalance, setVaultBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const [value, setValue] = useState<number | undefined>(undefined);
  const loadBalances = async () => {
    if (!address) return;
    const { formatted: walletBalance } = await getTokenBalance(
      address as `0x${string}`,
    );

    const { formatted: vaultBalance } = await getVaultBalance(
      address as `0x${string}`,
    );

    setBjtBalance(walletBalance);
    setVaultBalance(vaultBalance);
  };
  useEffect(() => {
    loadBalances();
  }, [address]);

  const handleWithdraw = async () => {
    if (!address || value === undefined || value <= 0) return;

    if (value % 1 !== 0) {
      console.error('Value must be a whole number');
      return;
    }

    const withdrawResult = await withdrawTokens(String(value));
    if (!withdrawResult.success) {
      throw new Error(
        `${withdrawResult.error ?? 'Unknown error'}` ||
          'Failed to withdraw tokens',
      );
    }
    console.log(`Successfully withdrew ${value} tokens`, 'success');
    loadBalances();
  };
  const handleDeposit = async () => {
    if (!address || value === undefined || value <= 0) return;

    // if value is not a whole number, throw an error
    if (value % 1 !== 0) {
      console.error('Value must be a whole number');
      return;
    }

    setLoading(true);

    console.log('Approving tokens...');
    // Step 1: Approve tokens
    const approvalResult = await approveTokens(String(value));
    if (!approvalResult.success) {
      throw new Error(
        `${approvalResult.error ?? 'Unknown error'}` ||
          'Failed to approve tokens',
      );
    }

    const depositResult = await depositTokens(String(value));
    if (!depositResult.success) {
      throw new Error(
        `${depositResult.error ?? 'Unknown error'}` ||
          'Failed to deposit tokens',
      );
    }
    console.log(`Successfully deposited ${value} tokens`, 'success');
    setLoading(false);
    loadBalances();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          onClick={() => (!user.isAuthenticated ? open() : null)}
          className="cursor-pointer rounded-full bg-zinc-100 text-zinc-900"
        >
          {user.walletAddress ? `Bal: ${vaultBalance}` : 'Connect Wallet'}
        </Button>
      </PopoverTrigger>
      {user.isAuthenticated && (
        <PopoverContent
          className="p-0 mx-4 rounded-xl overflow-hidden border-zinc-800"
          sideOffset={10}
        >
          <div className="flex flex-col bg-zinc-900 text-yellow-500 text-xs divide-y divide-zinc-800">
            <div className="flex justify-between items-center p-4">
              <div>Wallet Balance:</div>
              <div>{bjtBalance} ETH</div>
            </div>
            <div className="flex justify-between items-center p-4">
              <div>Vault Balance:</div>
              <div>{vaultBalance} ETH</div>
            </div>
            <div className="flex justify-between items-center p-4 space-x-4">
              <input
                placeholder="0"
                type="number"
                value={value}
                disabled={loading}
                // no decimals allowed
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  if (newValue >= 0 && newValue % 1 === 0) {
                    setValue(newValue);
                  }
                }}
                className="w-full bg-zinc-800 rounded-full h-7 px-3 focus:outline-none"
              />
              <button
                type="button"
                disabled={loading}
                className="cursor-pointer bg-yellow-500 py-1 px-3 text-xs rounded-full shrink-0 text-black flex items-center justify-center"
              >
                All
              </button>
            </div>
            <div className="flex justify-between space-x-4 items-center p-4">
              <button
                type="button"
                disabled={loading}
                onClick={handleWithdraw}
                className="cursor-pointer bg-yellow-500 py-1 w-full text-xs rounded-full text-black flex items-center justify-center"
              >
                Withdraw
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeposit}
                className="cursor-pointer bg-zinc-950 outline outline-zinc-800 text-yellow-500 py-1 w-full text-xs rounded-full flex items-center justify-center"
              >
                Deposit
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                disconnect();
                signOut({ redirect: false });
              }}
              className="flex justify-between items-center p-4 hover:bg-zinc-950/50 cursor-pointer"
            >
              <div>Disconnect</div>
              <LogOut className="text-yellow-500" size={18} />
            </button>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default WalletConnect;
