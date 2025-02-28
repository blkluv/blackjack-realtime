import { userAtom } from '@/atoms/user.atom';
import { useBlackjack } from '@/hooks/useBlackjack';
import { useWindowSize } from '@/hooks/useWindowSize';
import { truncateAddress } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { DeckOfCards } from '../DeckOfCards';

const MobileLayout = () => {
  const user = useAtomValue(userAtom);
  const { q, width } = useWindowSize();
  const { mySeat, blackjackSend, gameState } = useBlackjack();
  const [betAmount, setBetAmount] = useState(0);
  const numPlayers = 5;
  const curveHeight = q / 4.6;
  const radius = curveHeight + q / 15;
  const centerY = radius;
  return (
    <div className="md:hidden absolute top-72 flex flex-wrap items-center justify-center gap-8">
      {Array.from({ length: numPlayers }).map((_, i) => {
        const isMe = mySeat === i + 1;
        const player = gameState.players[i + 1];
        const hand = player ? player.hand : [];

        return (
          <div
            key={nanoid()}
            className="w-32 h-40 bg-zinc-60 flex flex-col items-center"
          >
            <DeckOfCards cards={hand} />
            {mySeat === -1 && !player && (
              <Button
                disabled={!user.isAuthenticated}
                onClick={() => {
                  blackjackSend({
                    type: 'playerJoin',
                    data: {
                      seat: i + 1,
                    },
                  });
                }}
                size="sm"
                className="bg-yellow-400 z-10 scale-90 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
              >
                Join Game
              </Button>
            )}
            {isMe && (
              <Button
                onClick={() => { }}
                size="sm"
                className="bg-red-400 text-black hover:bg-red-500 cursor-pointer rounded-lg"
              >
                Your Seat
              </Button>
            )}
            {player && (
              <div className="flex flex-col space-y-2 items-center z-10">
                <div className="rounded-full bg-amber-400 whitespace-nowrap px-2 py-0.5 text-xs font-mono w-fit font-bold border">
                  {isMe ? 'You' : truncateAddress(player.userId)}
                </div>
                <div className="rounded-full bg-violet-400 px-2 whitespace-nowrap py-0.5 text-xs font-mono w-fit font-bold border">
                  Bet: {player.bet}
                </div>
              </div>
            )}
            {isMe && player && gameState.status === 'playing' && (
              <div className="flex space-x-4">
                <Button
                  onClick={() => {
                    blackjackSend({
                      type: 'hit',
                      data: {},
                    });
                  }}
                  size="sm"
                  className="bg-green-400 text-black hover:bg-green-500 cursor-pointer rounded-lg"
                >
                  Hit
                </Button>
                <Button
                  onClick={() => {
                    blackjackSend({
                      type: 'stand',
                      data: {},
                    });
                  }}
                  size="sm"
                  className="bg-red-400 text-black hover:bg-red-500 cursor-pointer rounded-lg"
                >
                  Stand
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { MobileLayout };
