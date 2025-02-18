import { useBlackjack } from '@/hooks/useBlackjack';
import { useUser } from '@/hooks/useUser';
import { useWindowSize } from '@/hooks/useWindowSize';
import { truncateAddress } from '@/lib/utils';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { DeckOfCards } from '../DeckOfCards';

const DesktopLayout = () => {
  const { user } = useUser();
  const { q } = useWindowSize();
  const { mySeat, blackjackSend, gameState } = useBlackjack();
  const [betAmount, setBetAmount] = useState(0);
  const numPlayers = 5;
  const curveHeight = q / 4.6;
  const radius = curveHeight + q / 15;
  const centerY = radius;
  return (
    <div
      className="absolute w-full justify-center md:flex hidden"
      style={{ height: `${radius}px`, top: `${q / 96}px` }}
    >
      {Array.from({ length: numPlayers }).map((_, i) => {
        const mid = Math.floor(numPlayers / 2);
        const angleStep = Math.PI / (numPlayers + 1);
        const angle = (i - mid) * angleStep;
        const x = radius * Math.sin(angle);
        const y = centerY - radius * Math.cos(angle);
        const rotationAngle = Math.atan2(centerY - y, x) * (180 / Math.PI) - 90;
        const isMe = mySeat === i + 1;
        const player = gameState.players[i + 1];
        const hand = player?.hand || [];
        return (
          <div
            key={nanoid()}
            className="absolute transition-all duration-300 z-20 "
            style={{
              bottom: `${y}px`,
              left: `calc(50% + ${x}px)`,
              transform: `translateX(-50%) rotate(${rotationAngle}deg)`,
            }}
          >
            <DeckOfCards cards={hand} extraDelay={i * 0.6} />
            <div
              className="text-center whitespace-nowrap relative top-12 flex flex-col items-center space-y-2"
              style={{
                fontSize: `${q / 140}px`,
                transform: `rotate(${-rotationAngle}deg)`,
              }}
            >
              {mySeat === -1 && !player ? (
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
                  className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-full"
                >
                  Join Game
                </Button>
              ) : null}
              {isMe ? (
                <Button
                  onClick={() => {}}
                  size="sm"
                  className="bg-red-400 text-black cursor-pointer rounded-lg"
                >
                  Your Seat
                </Button>
              ) : null}
              {player && (
                <div className="flex space-x-4">
                  <div className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-mono w-fit font-bold border">
                    {truncateAddress(player.userId)}
                  </div>
                  <div className="rounded-full bg-violet-400 px-2 py-0.5 text-xs font-mono w-fit font-bold border">
                    Bet: {player.bet}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { DesktopLayout };
