import { betStateAtom } from '@/atoms/blackjack.atom';
import { soundAtom } from '@/atoms/sound.atom';
import { timeStateAtom } from '@/atoms/time.atom';
import { useBlackjack } from '@/hooks/useBlackjack';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import { useAtomValue, useSetAtom } from 'jotai';
import { Hand, HandCoins, HandHelping } from 'lucide-react';
import { motion } from 'motion/react';
import { type FC, useEffect, useState } from 'react';
import type { PlayerState } from '../../../../party/blackjack/blackjack.types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { SoundType } from '../Utils/sound';
// import { cn } from "@/lib/utils";
// import { useTimeState } from "@/atoms/time.atom";
// import { PlayerState } from "../../../../party/blackjack/blackjack.types";

const ControlCentre = () => {
  const { user } = useUser();
  const { blackjackSend, gameState } = useBlackjack();
  const [betAmount, setBetAmount] = useState('');
  const [player, setPlayer] = useState<PlayerState | undefined>(undefined);
  const { startedAt: startTime, state, userId } = useAtomValue(timeStateAtom);
  const betState = useAtomValue(betStateAtom);
  const playSound = useSetAtom(soundAtom);
  // const player = getCurrentPlayer();

  const isCurrentTurn =
    state === 'playerTimerStart' && userId === player?.userId;

  const isHitOrStand =
    player && gameState.status === 'playing' && player.bet > 0;

  const isBet =
    player &&
    (gameState.status === 'betting' || gameState.status === 'waiting');

  useEffect(() => {
    const getCurrentPlayer = () => {
      if (!user.walletAddress) return;
      for (const player of Object.values(gameState.players)) {
        if (player.userId === user.walletAddress) {
          return player;
        }
      }
    };
    setPlayer(getCurrentPlayer());
  }, [gameState, betAmount, user]);

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
                Number(e.target.value) < 0 ||
                Number(e.target.value) % 1 !== 0
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
          animate={false}
          disabled={!isHitOrStand}
          className="bg-emerald-900 text-zinc-100"
          icon={<HandHelping />}
          onClick={() => {
            // playSound(SoundType.DEAL);
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
          disabled={!isHitOrStand}
          animate={isHitOrStand && isCurrentTurn}
          icon={<Hand />}
          className="bg-red-900 text-zinc-100"
          onClick={() => {
            // playSound(SoundType.);
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
          text={`${betState === null ? 'Bet' : betState}`}
          disabled={
            !(isBet && (betState === null || betState === 'bet-placed')) ||
            !(Number(betAmount) > 0) ||
            player?.bet !== 0
          }
          icon={<HandCoins />}
          animate={isBet}
          className="text-zinc-900"
          onClick={() => {
            if (!player || player.bet !== 0) return;
            if (Number(betAmount) > 0) {
              playSound(SoundType.BET);
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
  disabled?: boolean;
  animate?: boolean;
  className?: string;
};

const BatteryButton: FC<TBatteryButtonProps> = ({
  text,
  icon,
  onClick,
  disabled,
  animate = true,
  className,
}) => {
  const [progress, setProgress] = useState(1);
  const { startedAt: startTime, state } = useAtomValue(timeStateAtom);
  // const [startTime] = useState(Date.now());
  const duration = 10000;

  useEffect(() => {
    const calculateProgress = () => {
      if (!animate) {
        setProgress(0);
        return;
      }
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const newProgress = Math.min(1, elapsed / duration);
      setProgress(1 - newProgress);
    };

    calculateProgress();

    const intervalId = setInterval(calculateProgress, 50); //10ms

    return () => {
      clearInterval(intervalId);
    };
  }, [startTime, disabled]);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          'w-full h-9 bg-zinc-200 rounded-full relative overflow-hidden',
          disabled && 'cursor-not-allowed bg-zinc-400',
          className,
        )}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{
            ease: 'linear',
          }}
          className="w-full h-full origin-left bg-yellow-500"
        />
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-zinc-300 rounded-r-sm -mr-1" />
      </div>

      <Button
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'cursor-pointer z-10 left-0 absolute top-0 space-x-0 w-full rounded-full',
          className,
          'bg-transparent',
        )}
      >
        <div className="font-semibold">{text}</div>
        {icon}
      </Button>
    </div>
  );
};
