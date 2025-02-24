import { useBlackjack } from '@/hooks/useBlackjack';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { MicIcon, MicOffIcon } from 'lucide-react';
import { useState } from 'react';
// import WalletConnect from '../auth/WalletConnect';
import { Button } from '../ui/button';

const ActionButtons = () => {
  const { user } = useUser();
  const { blackjackSend, gameState } = useBlackjack();
  const getPlayer = (userId: string) => {
    for (const player of Object.values(gameState.players)) {
      if (player.userId === userId) {
        return player;
      }
    }
  };
  const getCurrentPlayer = () => {
    if (!user.walletAddress) return;
    return getPlayer(user.walletAddress);
  };
  const [isMicOn, setIsMicOn] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const player = getCurrentPlayer();
  const isCurrentTurn =
    gameState.status === 'playing' &&
    player?.userId === gameState.playerOrder[gameState.currentPlayerIndex];


  return (
    <div className="flex fixed bottom-4 items-center p-4 border border-zinc-200/10 backdrop-blur-sm rounded-full space-x-4">
      {user.isAuthenticated && (
        <>
          <Button
            onClick={() => setIsMicOn(!isMicOn)}
            size="sm"
            className={cn(
              'bg-yellow-400 text-black cursor-pointer rounded-full',
              isMicOn
                ? 'bg-yellow-400 hover:bg-yellow-500'
                : 'bg-red-400 hover:bg-red-500',
            )}
          >
            {user.isAuthenticated ? (
              <MicIcon size={24} />
            ) : (
              <MicOffIcon size={24} />
            )}
          </Button>
          {player && gameState.status === 'playing' && player.bet > 0 && (
            <div className="flex space-x-4">
              <Button
                disabled={!isCurrentTurn}
                onClick={() => {
                  blackjackSend({
                    type: 'hit',
                    data: {},
                  });
                }}
                size="sm"
                className="bg-green-400 text-black hover:bg-green-500 cursor-pointer rounded-full"
              >
                Hit
              </Button>
              <Button
                disabled={!isCurrentTurn}
                onClick={() => {
                  blackjackSend({
                    type: 'stand',
                    data: {},
                  });
                }}
                size="sm"
                className="bg-red-400 text-black hover:bg-red-500 cursor-pointer rounded-full"
              >
                Stand
              </Button>
            </div>
          )}
          {player &&
            (gameState.status === 'betting' ||
              gameState.status === 'waiting') && (
              <div className="flex space-x-4">
                <input
                  disabled={player.bet !== 0}
                  type="number"
                  placeholder="Bet Amount"
                  value={player.bet !== 0 ? player.bet : betAmount}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0) setBetAmount(value);
                  }}
                  className="bg-transparent border appearance-none border-amber-400 rounded-full px-2 py-1 text-sm text-white w-24"
                />
                <Button
                  disabled={player.bet !== 0}
                  onClick={() => {
                    if (player.bet !== 0) return;
                    if (betAmount > 0) {
                      blackjackSend({
                        type: 'placeBet',
                        data: {
                          bet: betAmount,
                        },
                      });
                    } else {
                      console.log('Enter amount > 0');
                    }
                  }}
                  size="sm"
                  className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-full"
                >
                  Bet
                </Button>
              </div>
            )}
        </>
      )}

      {/* <WalletConnect /> */}
    </div>
  );
};
export { ActionButtons };
