import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { MicIcon, MicOffIcon } from "lucide-react";
// import WalletConnect from '../auth/WalletConnect';
import { Button } from "../ui/button";
import { useBlackjack } from "@/hooks/useBlackjack";
import { useState } from "react";

const ActionButtons = () => {
  const { user } = useUser();
  const { mySeat, blackjackSend, gameState } = useBlackjack();
  const getPlayer = (userId: string) => {
    for (const player of Object.values(gameState.players)) {
      if (player.userId === userId) {
        return player;
      }
    }
  };
  const getCurrentPlayer = () => {
    if (!user.walletAddress) return;
    return getPlayer(user.walletAddress);
  };
  const [betAmount, setBetAmount] = useState(0);
  const player = getCurrentPlayer();

  return (
    <div className="flex fixed bottom-4 items-center p-4 border border-zinc-200/10 backdrop-blur-sm rounded-full space-x-4">
      {user.isAuthenticated && (
        <>
          <Button
            onClick={() => alert("todo")}
            size="sm"
            className={cn(
              "bg-yellow-400 text-black cursor-pointer rounded-full"
              // isMicOn
              //   ? 'bg-yellow-400 hover:bg-yellow-500'
              //   : 'bg-red-400 hover:bg-red-500',
            )}
          >
            {user.isAuthenticated ? (
              <MicIcon size={24} />
            ) : (
              <MicOffIcon size={24} />
            )}
          </Button>
          {player && gameState.status === "playing" && (
            <div className="flex space-x-4">
              <Button
                onClick={() => {
                  blackjackSend({
                    type: "hit",
                    data: {},
                  });
                }}
                size="sm"
                className="bg-green-400 text-black hover:bg-green-500 cursor-pointer rounded-full"
              >
                Hit
              </Button>
              <Button
                onClick={() => {
                  blackjackSend({
                    type: "stand",
                    data: {},
                  });
                }}
                size="sm"
                className="bg-red-400 text-black hover:bg-red-500 cursor-pointer rounded-full"
              >
                Stand
              </Button>
            </div>
          )}
          {player &&
            (gameState.status === "betting" ||
              gameState.status === "waiting") && (
              <div className="flex space-x-4">
                <input
                  type="number"
                  placeholder="Bet Amount"
                  value={betAmount}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0) setBetAmount(value);
                  }}
                  className="bg-transparent border appearance-none border-amber-400 rounded-full px-2 py-1 text-sm text-white w-24"
                />
                <Button
                  onClick={() => {
                    if (betAmount > 0) {
                      blackjackSend({
                        type: "placeBet",
                        data: {
                          bet: betAmount,
                        },
                      });
                    }
                  }}
                  size="sm"
                  className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-full"
                >
                  Bet
                </Button>
              </div>
            )}
        </>
      )}

      {/* <WalletConnect /> */}
    </div>
  );
};
export { ActionButtons };
