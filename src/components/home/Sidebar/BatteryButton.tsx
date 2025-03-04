import { timeStateAtom } from '@/atoms/time.atom';
import { cn } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import { motion } from 'motion/react';
import { type FC, useEffect, useState } from 'react';
import {
  BETTING_PERIOD,
  PLAYER_TURN_PERIOD,
} from '../../../../party/blackjack/blackjack.types';

type TBatteryButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  animate?: boolean;
  className?: string;
  isBet?: boolean;
  children?: React.ReactNode;
};

const BatteryButton: FC<TBatteryButtonProps> = ({
  onClick,
  disabled,
  animate = true,
  className,
  isBet,
  children,
}) => {
  const [progress, setProgress] = useState(0);
  const { startedAt: startTime } = useAtomValue(timeStateAtom);
  const duration = isBet ? BETTING_PERIOD : PLAYER_TURN_PERIOD;

  useEffect(() => {
    const calculateProgress = () => {
      if (!animate) {
        setProgress(0);
        return;
      }
      const elapsed = Date.now() - startTime;
      setProgress(1 - Math.min(1, elapsed / duration));
    };

    calculateProgress();

    const intervalId = setInterval(calculateProgress, 50); // 50ms

    return () => {
      clearInterval(intervalId);
    };
  }, [startTime]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full h-12 bg-zinc-950 border-zinc-800 border rounded-lg overflow-hidden',
        className,
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      <motion.div
        animate={{ scaleX: progress }}
        transition={{ ease: 'linear' }}
        className="absolute top-0 left-0 h-full w-full origin-left bg-yellow-500"
      />
      <span className="relative z-10 font-semibold flex">{children}</span>
    </button>
  );
};

export default BatteryButton;
