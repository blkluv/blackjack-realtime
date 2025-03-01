import { betStateAtom } from "@/atoms/blackjack.atom";
import { timeStateAtom } from "@/atoms/time.atom";
import { userAtom } from "@/atoms/user.atom";
import CustomButton from "@/components/ui/CustomButton";
import { useBlackjack } from "@/hooks/useBlackjack";
import { useVault } from "@/hooks/useVault";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { Hand, HandCoins, HandHelping } from "lucide-react";
import { motion } from "motion/react";
import { type FC, useEffect, useState } from "react";
import {
  BETTING_PERIOD,
  PLAYER_TURN_PERIOD,
  type PlayerState,
} from "../../../../party/blackjack/blackjack.types";
import { Input } from "../../ui/input";
import { ESoundType, playSound } from "../Utils/sound";

const ControlCentre = () => {
  const user = useAtomValue(userAtom);
  const { blackjackSend, gameState } = useBlackjack();
  const [betAmount, setBetAmount] = useState("");
  const [player, setPlayer] = useState<PlayerState | undefined>(undefined);
  const { state, userId } = useAtomValue(timeStateAtom);
  const { balances } = useVault();
  const betState = useAtomValue(betStateAtom);

  const isCurrentTurn =
    state === "playerTimerStart" && !!player && userId === player.userId;

  const isHitOrStand =
    !!player &&
    gameState.status === "playing" &&
    player.bet > 0 &&
    isCurrentTurn;

  const isBet =
    !!player &&
    (gameState.status === "betting" || gameState.status === "waiting");

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
            className="border-zinc-800 bg-zinc-900 rounded-lg focus-visible:ring-zinc-700"
          />
          <CustomButton
            dark
            onClick={() => {
              setBetAmount(balances.vaultBalance);
            }}
          >
            All In
          </CustomButton>
        </div>
      </div>
      <div className="flex px-4 space-x-4">
        <BatteryButton
          text="Hit"
          animate={false}
          disabled={!isHitOrStand}
          className="text-zinc-100"
          bgColor="bg-green-900"
          icon={<HandHelping />}
          onClick={() => {
            // playSound(SoundType.DEAL);
            blackjackSend({
              type: "hit",
              data: {},
            });
          }}
        />
        <BatteryButton
          text="Stand"
          disabled={!isHitOrStand}
          animate={isHitOrStand}
          icon={<Hand />}
          className="text-zinc-100"
          bgColor="bg-red-900"
          onClick={() => {
            // playSound(SoundType.);
            blackjackSend({
              type: "stand",
              data: {},
            });
          }}
        />
      </div>
      <div className="px-4">
        <BatteryButton
          text={`${betState === null ? "Bet" : betState}`}
          disabled={
            !(isBet && (betState === null || betState === "bet-placed")) ||
            !(Number(betAmount) > 0) ||
            player?.bet !== 0
          }
          icon={<HandCoins />}
          animate={isBet}
          className="text-zinc-900"
          isBet
          onClick={() => {
            if (!player || player.bet !== 0) return;
            if (Number(betAmount) > 0) {
              // playSound(SoundType.BET);
              playSound(ESoundType.BET);
              blackjackSend({
                type: "placeBet",
                data: {
                  bet: Number(betAmount),
                },
              });
            } else {
              console.log("Enter amount > 0");
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
          "w-full h-9 rounded-lg relative overflow-hidden",
          disabled ? "cursor-not-allowed bg-zinc-400" : "bg-zinc-200",
          className
        )}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{
            ease: "linear",
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
          "z-10 absolute left-0 top-0 w-full py-0 h-9",
          "bg-transparent border-none shadow-none",
          className
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
