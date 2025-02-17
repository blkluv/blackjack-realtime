import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { MicIcon, MicOffIcon } from 'lucide-react';
import WalletConnect from '../auth/WalletConnect';
import { Button } from '../ui/button';

const ActionButtons = () => {
  const { user } = useUser();

  return (
    <div className="flex fixed bottom-4 items-center p-4 border border-zinc-200/10 backdrop-blur-sm rounded-xl space-x-4">
      {user.isAuthenticated && (
        <>
          <Button
            onClick={() => alert('todo')}
            size="sm"
            className={cn(
              'bg-yellow-400 text-black cursor-pointer rounded-lg',
              // isMicOn
              //   ? 'bg-yellow-400 hover:bg-yellow-500'
              //   : 'bg-red-400 hover:bg-red-500',
            )}
          >
            {user.isAuthenticated ? (
              <MicIcon size={24} />
            ) : (
              <MicOffIcon size={24} />
            )}
          </Button>
          {/* <Button
            size="sm"
            className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
          >
            Hit
          </Button>
          <Button
            size="sm"
            className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
          >
            Stand
          </Button>
          <Button
            size="sm"
            className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
          >
            Start Game
          </Button> */}
        </>
      )}

      {/* <Button
        size={'sm'}
        className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
        onClick={() => (!isAuthenticated && isConnected ? joinGame(2) : open())}
      >
        {isAuthenticated
          ? truncateAddress(walletAddress)
          : isConnected
            ? 'Join Game'
            : 'Connect Wallet'}
      </Button> */}
      <WalletConnect />
    </div>
  );
};
export { ActionButtons };
