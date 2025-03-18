import { betStateAtom, betStatusLabels } from '@/atoms/blackjack.atom';
import { timeStateAtom } from '@/atoms/time.atom';
import { userAtom } from '@/atoms/user.atom';
import CustomButton from '@/components/ui/CustomButton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBlackjack } from '@/hooks/useBlackjack';
import { useVault } from '@/hooks/useVault';
import { useAtomValue } from 'jotai';
import { Hand, HandCoins, HandHelping } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PlayerState } from '../../../party/blackjack/blackjack.types';
import { Input } from '../ui/input';
import BatteryButton from './Sidebar/BatteryButton';
import { ESoundType, playSound } from './Utils/sound';

const ControlCentre = () => {
  const user = useAtomValue(userAtom);
  const { blackjackSend, gameState } = useBlackjack();
  const [betAmount, setBetAmount] = useState('');
  const [player, setPlayer] = useState<PlayerState | undefined>(undefined);
  const { state, userId } = useAtomValue(timeStateAtom);
  const { balances } = useVault();
  const betState = useAtomValue(betStateAtom);

  const displayLabel =
    betState !== null && betStatusLabels[betState]
      ? betStatusLabels[betState]
      : 'Bet';

  const isCurrentTurn =
    state === 'playerTimerStart' && !!player && userId === player.userId;

  const isHitOrStand =
    !!player &&
    gameState.status === 'playing' &&
    player.bet > 0 &&
    isCurrentTurn;

  const isBet =
    !!player &&
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
    <div className="flex flex-col space-y-4 py-4 border-b border-zinc-900 w-full lg:hidden">
      <div className="flex px-4 space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full" asChild>
              <BatteryButton
                animate={false}
                disabled={!isHitOrStand}
                className="text-zinc-100 bg-green-600"
                onClick={() => {
                  blackjackSend({
                    type: 'hit',
                    data: {},
                  });
                }}
              >
                <div className="flex justify-center w-full space-x-1">
                  <div className="w-fit">Hit</div>
                  <HandHelping />
                </div>
              </BatteryButton>
            </TooltipTrigger>
            <TooltipContent>
              <p className="bg-zinc-950 text-zinc-300 p-2 w-64 rounded-xl border border-zinc-900">
                Take another card from the dealer. You can hit as many times as
                you like, but if you go over 21, you bust!
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="w-full" asChild>
              <BatteryButton
                disabled={!isHitOrStand}
                animate={isHitOrStand}
                className="text-zinc-100 h-12 bg-red-600"
                onClick={() => {
                  blackjackSend({
                    type: 'stand',
                    data: {},
                  });
                }}
              >
                <div className="flex justify-center w-full space-x-1  items-center">
                  <div className="w-fit">Stand</div>
                  <Hand size={18} />
                </div>
              </BatteryButton>
            </TooltipTrigger>
            <TooltipContent>
              <p className="bg-zinc-950 text-zinc-300 p-2 w-64 rounded-xl border border-zinc-900">
                Keep your hand as is. The dealer will then reveal their hidden
                card and draw cards until they have 17 or higher.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex space-x-4 w-full px-4">
        <div className="w-full">
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
            className="border-zinc-800 h-11 w-full bg-zinc-900 rounded-lg focus-visible:ring-zinc-700"
          />
        </div>

        <div className="flex space-x-4 w-full">
          <CustomButton
            dark
            onClick={() => {
              setBetAmount(balances.vaultBalance);
            }}
            className="w-fit h-11"
          >
            All In
          </CustomButton>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full" asChild>
                <BatteryButton
                  disabled={
                    !(
                      isBet &&
                      (betState === null || betState === 'bet-placed')
                    ) ||
                    !(Number(betAmount) > 0) ||
                    player?.bet !== 0 ||
                    Number(betAmount) > Number(balances.vaultBalance)
                  }
                  animate={false}
                  className="text-zinc-900 h-12 bg-zinc-200"
                  isBet
                  onClick={() => {
                    if (!player || player.bet !== 0) return;
                    if (Number(betAmount) > 0) {
                      playSound(ESoundType.BET);
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
                >
                  <div className="flex justify-center w-full space-x-1  items-center">
                    <div className="w-fit">{displayLabel}</div>
                    <HandCoins size={18} />
                  </div>
                </BatteryButton>
              </TooltipTrigger>
              <TooltipContent>
                <p className="bg-zinc-950 text-zinc-300 p-2 w-64 rounded-xl border border-zinc-900">
                  Place your bet before the game starts. You can't change your
                  bet once the game has started.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default ControlCentre;
