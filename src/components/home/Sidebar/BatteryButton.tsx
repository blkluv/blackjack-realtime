import { timeStateAtom } from '@/atoms/time.atom';
import CustomButton from '@/components/ui/CustomButton';

import { cn } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import { motion } from 'motion/react';
import { type FC, useEffect, useState } from 'react';
import {
  BETTING_PERIOD,
  PLAYER_TURN_PERIOD,
} from '../../../../party/blackjack/blackjack.types';

type TBatteryButtonProps = {
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  animate?: boolean;
  className?: string;
  bgColor?: string;
  isBet?: boolean;
};

const BatteryButton: FC<TBatteryButtonProps> = ({
  text,
  icon,
  onClick,
  disabled,
  animate = true,
  className,
  bgColor,
  isBet,
}) => {
  const [progress, setProgress] = useState(1);
  const { startedAt: startTime } = useAtomValue(timeStateAtom);
  const duration = isBet ? BETTING_PERIOD : PLAYER_TURN_PERIOD;

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

    const intervalId = setInterval(calculateProgress, 50); // 50ms

    return () => {
      clearInterval(intervalId);
    };
  }, [startTime, disabled, animate]);

  return (
    <div className="relative w-full">
      <div
        className={cn(
          'w-full h-9 rounded-lg relative overflow-hidden',
          disabled ? 'cursor-not-allowed bg-zinc-400' : 'bg-zinc-200',
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

      <CustomButton
        disabled={disabled}
        onClick={onClick}
        bgColor={bgColor}
        className={cn(
          'z-10 absolute left-0 top-0 w-full py-0 h-9',
          'bg-transparent border-none shadow-none',
          className,
        )}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="font-semibold">{text}</span>
          {icon}
        </div>
      </CustomButton>
    </div>
  );
};

export default BatteryButton;
