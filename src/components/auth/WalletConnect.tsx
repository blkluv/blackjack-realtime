'use client';
import { setTriggerBalanceRefreshAtom } from '@/atoms/blackjack.atom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/hooks/useUser';
import { useVault } from '@/hooks/useVault';
import { client } from '@/lib/client';
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from '@reown/appkit/react';
import { useSetAtom } from 'jotai';
import { Coins, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';
// import { Button } from "../ui/button";
import CustomButton from '../ui/CustomButton';

const WalletConnect = () => {
  const { user } = useUser();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { address } = useAppKitAccount();
  const { balances, withdraw, deposit, transaction } = useVault();
  const [value, setValue] = useState<number | undefined>(undefined);

  const handleWithdraw = async () => {
    if (!address || value === undefined || value <= 0) return;

    if (value % 1 !== 0) {
      console.error('Value must be a whole number');
      return;
    }

    await withdraw(String(value));
  };
  const handleDeposit = async () => {
    if (!address || value === undefined || value <= 0) return;

    await deposit(String(value));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div>
          <CustomButton onClick={() => (!user.isAuthenticated ? open() : null)}>
            {user.walletAddress
              ? `Bal: ${balances.vaultBalance}`
              : 'Connect Wallet'}
          </CustomButton>
        </div>
      </PopoverTrigger>
      {user.isAuthenticated && (
        <PopoverContent
          className="p-0 mx-4 rounded-xl overflow-hidden border-zinc-700"
          sideOffset={10}
        >
          <div className="flex flex-col bg-zinc-900/60 backdrop-blur-2xl text-zinc-200 text-xs divide-y divide-zinc-700">
            <div className="flex justify-between items-center p-4">
              <div>Wallet Balance:</div>
              <div>{balances.tokenBalance} $BJT</div>
            </div>
            <div className="flex justify-between items-center p-4">
              <div>Vault Balance:</div>
              <div>{balances.vaultBalance} $BJT</div>
            </div>
            <Faucet />
            <div className="flex justify-between items-center p-4 space-x-4">
              <input
                placeholder="0"
                type="number"
                value={value}
                disabled={transaction.isLoading}
                // no decimals allowed
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  if (newValue >= 0 && newValue % 1 === 0) {
                    setValue(newValue);
                  }
                }}
                className="w-full bg-zinc-200 font-bold text-zinc-900 rounded-md h-7 px-3 focus:outline-none disabled:bg-zinc-700"
              />
            </div>
            <div className="flex justify-between space-x-4 items-center p-4">
              <CustomButton
                onClick={handleWithdraw}
                disabled={transaction.isLoading}
                className="w-full"
              >
                Withdraw
              </CustomButton>

              <CustomButton
                disabled={transaction.isLoading}
                onClick={handleDeposit}
                className="w-full"
              >
                Deposit
              </CustomButton>
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
              <LogOut className="text-red-500" size={18} />
            </button>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default WalletConnect;

const Faucet = () => {
  const setTriggerBalanceRefresh = useSetAtom(setTriggerBalanceRefreshAtom);
  const handleClaim = async () => {
    try {
      const data = await client.bjt.getBjtTokens.$get();
      const res = await data.json();
      if (res.success) {
        toast.success(res.message);
        setTriggerBalanceRefresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error('Failed to claim tokens from faucet');
    }
  };
  return (
    <div
      onClick={handleClaim}
      onKeyDown={handleClaim}
      className="flex justify-between hover:bg-zinc-950/50 cursor-pointer items-center p-4"
    >
      <div>Get $BJT tokens</div>
      <div>
        <Coins size={16} />
      </div>
    </div>
  );
};
