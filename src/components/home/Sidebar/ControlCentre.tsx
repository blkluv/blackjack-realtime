import { useBlackjack } from '@/hooks/useBlackjack';
import { useUser } from '@/hooks/useUser';
import { Hand, HandCoins, HandHelping } from 'lucide-react';
import { motion } from 'motion/react';
import { type FC, useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
// import { cn } from "@/lib/utils";
// import { useTimeState } from "@/atoms/time.atom";
// import { PlayerState } from "../../../../party/blackjack/blackjack.types";

const ControlCentre = () => {
  const { user } = useUser();
  const { blackjackSend, gameState } = useBlackjack();
  const [betAmount, setBetAmount] = useState('');

  const getCurrentPlayer = () => {
    if (!user.walletAddress) return;
    for (const player of Object.values(gameState.players)) {
      if (player.userId === user.walletAddress) {
        return player;
      }
    }
  };

  const startTime = 1740444055106;

  const player = getCurrentPlayer();

  const isCurrentTurn =
    gameState.status === 'playing' &&
    player?.userId === gameState.playerOrder[gameState.currentPlayerIndex];

  const isHitOrStand =
    player && gameState.status === 'playing' && player.bet > 0;

  const isBet =
    player &&
    (gameState.status === 'betting' || gameState.status === 'waiting') &&
    Number(betAmount) > 0;

  return (
    <div className="flex flex-col space-y-4 py-4 border-b border-zinc-900">
      <div className="flex flex-col space-y-2 px-4">
        <div className="text-zinc-400 text-sm">Bet Amount</div>
        <div className="flex space-x-4">
          <Input
            value={betAmount}
            onChange={(e) => {
              if (
                Number.isNaN(Number(e.target.value)) ||
                Number(e.target.value) < 0
              )
                return;
              setBetAmount(e.target.value);
            }}
            placeholder="Place your bet"
            className="border-zinc-800 bg-zinc-900 rounded-full focus-visible:ring-zinc-700"
          />
          <Button className="cursor-pointer rounded-full text-zinc-100 bg-zinc-900 border border-zinc-800">
            All
          </Button>
        </div>
      </div>
      <div className="flex px-4 space-x-4">
        <BatteryButton
          text="Hit"
          icon={<HandHelping />}
          onClick={() => {
            blackjackSend({
              type: 'hit',
              data: {},
            });
          }}
        />
        {/* <Button
          disabled={!isHitOrStand}
          onClick={() => {
            blackjackSend({
              type: "hit",
              data: {},
            });
          }}
          className="cursor-pointer space-x-0 w-full rounded-full text-zinc-100 bg-zinc-900 border border-zinc-800"
        >
          <div className="font-semibold">Hit</div>
          <HandHelping />
        </Button> */}
        <BatteryButton
          text="Stand"
          icon={<Hand />}
          onClick={() => {
            blackjackSend({
              type: 'stand',
              data: {},
            });
          }}
        />
        {/* <Button
          disabled={!isHitOrStand}
          onClick={() => {
            blackjackSend({
              type: "stand",
              data: {},
            });
          }}
          className="cursor-pointer w-full rounded-full text-zinc-100 bg-zinc-900 border border-zinc-800"
        >
          <div className="font-semibold">Stand</div>
          <Hand />
        </Button> */}
      </div>
      <div className="px-4">
        <BatteryButton
          text="Bet"
          icon={<HandCoins />}
          onClick={() => {
            if (!player || player.bet !== 0) return;
            if (Number(betAmount) > 0) {
              blackjackSend({
                type: 'placeBet',
                data: {
                  bet: Number(betAmount),
                },
              });
            } else {
              console.log('Enter amount > 0');
            }
          }}
        />
      </div>
    </div>
  );
};

export default ControlCentre;

type TBatteryButtonProps = {
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
};

const BatteryButton: FC<TBatteryButtonProps> = ({ text, icon, onClick }) => {
  const [progress, setProgress] = useState(1);
  const [startTime] = useState(Date.now());
  const duration = 10000;

  useEffect(() => {
    // Calculate how much time has passed since component mounted
    const calculateProgress = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const newProgress = Math.min(1, elapsed / duration);
      setProgress(1 - newProgress); // Reverse for discharge effect (1 to 0)
    };

    // Initial calculation
    calculateProgress();

    // Update progress every 50ms for smooth animation
    const intervalId = setInterval(calculateProgress, 50);

    return () => {
      clearInterval(intervalId);
    };
  }, [startTime]);

  return (
    <div className="relative w-full">
      {/* Battery Container */}
      <div className="w-full h-9 bg-zinc-200 rounded-full relative overflow-hidden">
        {/* Animated Battery Level */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: progress }}
          className="w-full h-full origin-left bg-green-500"
        />

        {/* Battery Tip */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-zinc-300 rounded-r-sm -mr-1" />
      </div>

      {/* Button Overlay */}
      <Button
        onClick={onClick}
        className="cursor-pointer z-10 bg-transparent left-0 text-zinc-950 absolute top-0 space-x-0 w-full rounded-full"
      >
        <div className="font-semibold text-zinc-900">{text}</div>
        {icon}
      </Button>
    </div>
  );
};
