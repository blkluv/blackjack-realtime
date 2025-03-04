import { rulesAtom } from '@/atoms/rules.atom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAtom } from 'jotai';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { BETTING_PERIOD } from '../../../party/blackjack/blackjack.types';

const Rules = () => {
  const [isOpen, setIsOpen] = useAtom(rulesAtom);
  type TTabs = 'basic' | 'advanced';
  const [activeTab, setActiveTab] = useState<TTabs>('basic');

  const handleClose = (value: boolean) => {
    setIsOpen(value);
    if (!value) {
      localStorage.setItem('hasSeenRules', 'true');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <HelpCircle size={24} />
        </div>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/10 h-[40rem] backdrop-blur-3xl text-zinc-100 border-zinc-900 p-6 flex flex-col">
        <DialogHeader className="h-0 hidden">
          <DialogTitle> </DialogTitle>
          <DialogDescription> </DialogDescription>
        </DialogHeader>
        {/* tabs */}
        <div className="flex h-16 space-x-4 justify-center border-b border-zinc-800">
          {['basic', 'advanced'].map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab as TTabs)}
              className={`p-4 text-sm font-bold cursor-pointer focus-visible:outline-none ${
                activeTab === tab
                  ? 'text-white border-b-2 border-white'
                  : 'text-zinc-400'
              }`}
            >
              {tab === 'basic' ? 'Basics' : 'Advanced'}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto mt-4">
          {activeTab === 'basic' ? (
            <div className="flex flex-col space-y-4">
              <div className="font-bold text-lg">🎯 Objective</div>
              <div>
                Get as close to <b>21</b> as possible without going over. Beat
                the dealer to win! 🏆
              </div>

              {/* Card Points Section */}
              <div className="font-bold text-lg">🃏 Card Points</div>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <b>Number Cards (2-10):</b> Face value.
                </li>
                <li>
                  <b>Face Cards (J, Q, K):</b> Always <b>10</b>.
                </li>
                <li>
                  <b>Ace (A):</b> Can be <b>1</b> or <b>11</b> (whichever
                  benefits you).
                </li>
              </ul>

              <div className="font-bold text-lg">🎭 How to Play</div>
              <ul className="list-decimal pl-6 space-y-2">
                <li>
                  💰 <b>Place Your Bet:</b> {BETTING_PERIOD / 1000} seconds to
                  bet after the first player.
                </li>
                <li>
                  🃏 <b>Get Your Cards:</b> You & dealer get 2 cards. Dealer
                  keeps one hidden.
                </li>
                <li>
                  🎯 <b>Your Turn:</b> Choose to <b>Hit</b> (draw) or{' '}
                  <b>Stand</b> (hold).
                </li>
                <li>
                  🎭 <b>Dealer's Turn:</b> Dealer reveals their card & plays.
                </li>
                <li>
                  🏆 <b>Win or Lose:</b> Beat the dealer or avoid busting!
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="font-bold text-lg">🏆 Winning Conditions</div>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <b>Blackjack (A + 10):</b> Instant win unless the dealer
                    also has one.
                  </li>
                  <li>
                    <b>Higher Score:</b> Beat the dealer’s total without going
                    over 21.
                  </li>
                  <li>
                    <b>Dealer Busts:</b> If the dealer exceeds 21, you win
                    automatically.
                  </li>
                  <li>
                    <b>Push (Tie):</b> If you and the dealer have the same
                    total, no one wins.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="font-bold text-lg">💡 Pro Strategy</div>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    ✅ <b>Stand on 17+:</b> Higher risk of busting if you hit.
                  </li>
                  <li>
                    ✅ <b>Hit on 12-16 if Dealer Shows 7+:</b> The dealer likely
                    has a strong hand.
                  </li>
                  <li>
                    ✅ <b>Use the Timer:</b> Plan your moves wisely within the
                    given time.
                  </li>
                  <li>
                    🚫 <b>Avoid Unnecessary Risks:</b> If you have a solid hand,
                    don’t overplay.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="font-bold text-lg">🎭 Dealer Rules</div>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    👨‍💼 Dealer <b>must hit</b> if they have 16 or less.
                  </li>
                  <li>
                    🛑 Dealer <b>must stand</b> on 17 or higher.
                  </li>
                  <li>
                    ⚖️ If you & dealer tie, it's a <b>push</b> (dealer wins).
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Rules;
