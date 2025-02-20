'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser } from '@/hooks/useUser';
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from '@reown/appkit/react';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/button';

const WalletConnect = () => {
  const fakeBalance = 75.65124;
  const { open } = useAppKit();
  const { user } = useUser();
  const { disconnect } = useDisconnect();
  const { address } = useAppKitAccount();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          onClick={() => (!user.isAuthenticated ? open() : null)}
          className="cursor-pointer rounded-full bg-zinc-100 text-zinc-900"
        >
          {user.walletAddress ? `Bal: ${fakeBalance}` : 'Connect Wallet'}
        </Button>
      </PopoverTrigger>
      {user.isAuthenticated && (
        <PopoverContent
          className="p-0 mx-4 rounded-xl overflow-hidden border-zinc-800"
          sideOffset={10}
        >
          <div className="flex flex-col bg-zinc-900 text-yellow-500 text-xs divide-y divide-zinc-800">
            <div className="flex justify-between items-center p-4">
              <div>Balance:</div>
              <div>{fakeBalance} ETH</div>
            </div>
            <div className="flex justify-between items-center p-4 space-x-4">
              <input
                placeholder="0"
                className="w-full bg-zinc-800 rounded-full h-7 px-3 focus:outline-none"
              />
              <button
                type="button"
                className="cursor-pointer bg-yellow-500 py-1 px-3 text-xs rounded-full shrink-0 text-black flex items-center justify-center"
              >
                All
              </button>
            </div>
            <div className="flex justify-between space-x-4 items-center p-4">
              <button
                type="button"
                className="cursor-pointer bg-yellow-500 py-1 w-full text-xs rounded-full text-black flex items-center justify-center"
              >
                Withdraw
              </button>
              <button
                type="button"
                className="cursor-pointer bg-zinc-950 outline outline-zinc-800 text-yellow-500 py-1 w-full text-xs rounded-full flex items-center justify-center"
              >
                Deposit
              </button>
            </div>
            <button
              type="button"
              onClick={() => disconnect()}
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
