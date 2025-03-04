import { betStateAtom } from '@/atoms/blackjack.atom';
import { timeStateAtom } from '@/atoms/time.atom';
import { userAtom } from '@/atoms/user.atom';
import CustomButton from '@/components/ui/CustomButton';
import { useBlackjack } from '@/hooks/useBlackjack';
import { useVault } from '@/hooks/useVault';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import type { PlayerState } from '../../../party/blackjack/blackjack.types';
import { Input } from '../ui/input';
import BatteryButton from './Sidebar/BatteryButton';
import { ESoundType, playSound } from './Utils/sound';

const MobileControlCentre = () => {
  const user = useAtomValue(userAtom);
  const { blackjackSend, gameState } = useBlackjack();
  const [betAmount, setBetAmount] = useState('');
  const [player, setPlayer] = useState<PlayerState | undefined>(undefined);
  const { state, userId } = useAtomValue(timeStateAtom);
  const { balances } = useVault();
  const betState = useAtomValue(betStateAtom);

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
    <div className="flex flex-col space-y-4 py-4 border-b border-zinc-900">
      {/* <div className="flex flex-col space-y-2 px-4"></div> */}
      <div className="flex px-4 space-x-4">
        <BatteryButton
          animate={false}
          disabled={!isHitOrStand}
          // increase font size
          className="text-zinc-100 h-12 bg-green-600"
          onClick={() => {
            // playSound(SoundType.DEAL);
            blackjackSend({
              type: 'hit',
              data: {},
            });
          }}
        />
        <BatteryButton
          disabled={!isHitOrStand}
          animate={isHitOrStand}
          className="text-zinc-100 h-12 bg-red-600"
          onClick={() => {
            // playSound(SoundType.);
            blackjackSend({
              type: 'stand',
              data: {},
            });
          }}
        />
      </div>
      <div className="px-4 flex space-x-4">
        <div className="flex space-x-4 w-full">
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
        <BatteryButton
          disabled={
            !(isBet && (betState === null || betState === 'bet-placed')) ||
            !(Number(betAmount) > 0) ||
            player?.bet !== 0
          }
          animate={isBet}
          className="text-zinc-900 h-12 w-1/3"
          isBet
          onClick={() => {
            if (!player || player.bet !== 0) return;
            if (Number(betAmount) > 0) {
              // playSound(SoundType.BET);
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
        />
      </div>
    </div>
  );
};

export default MobileControlCentre;
