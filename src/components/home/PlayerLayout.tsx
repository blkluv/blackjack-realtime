import { useBlackjack } from "@/hooks/useBlackjack";
import { useUser } from "@/hooks/useUser";
import { useWindowSize } from "@/hooks/useWindowSize";
import { getRandomCard, truncateAddress } from "@/lib/utils";
import { nanoid } from "nanoid";
import { useState } from "react";
import { Button } from "../ui/button";
import { DeckOfCards } from "./DeckOfCards";

const MOBILE_BREAKPOINT = 768;

const PlayerLayout = () => {
  const { user } = useUser();
  const { q, width } = useWindowSize();
  const isMobile = width < MOBILE_BREAKPOINT;
  const { mySeat, blackjackSend, gameState } = useBlackjack();
  const [betAmount, setBetAmount] = useState(0);

  const numPlayers = 5;
  const curveHeight = q / 4.6;
  const radius = curveHeight + q / 15;
  const centerY = radius;
  return (
    <>
      <div className="md:hidden absolute top-72 flex flex-wrap items-center justify-center gap-8">
        {Array.from({ length: numPlayers }).map((_, i) => {
          const isMe = mySeat === i + 1;
          const player = gameState.players[i + 1];
          return (
            <div
              key={nanoid()}
              className="w-32 h-40 bg-zinc-60 flex flex-col items-center"
            >
              <DeckOfCards
                cards={Array.from({ length: 2 }).map(() => getRandomCard())}
              />
              {mySeat === -1 && !player && (
                <Button
                  disabled={!user.isAuthenticated}
                  onClick={() => {
                    blackjackSend({
                      type: "playerJoin",
                      data: {
                        seat: i + 1,
                      },
                    });
                  }}
                  size="sm"
                  className="bg-yellow-400 z-10 scale-90 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
                >
                  Join Game
                </Button>
              )}
              {/* {isMe && (
                <Button
                  onClick={() => {}}
                  size="sm"
                  className="bg-red-400 text-black hover:bg-red-500 cursor-pointer rounded-lg"
                >
                  Your Seat
                </Button>
              )} */}
              {player && (
                <div className="flex flex-col space-y-2 items-center z-10">
                  <div className="rounded-full bg-amber-400 whitespace-nowrap px-2 py-0.5 text-xs font-mono w-fit font-bold border">
                    {isMe ? "You" : truncateAddress(player.userId)}
                  </div>
                  <div className="rounded-full bg-violet-400 px-2 whitespace-nowrap py-0.5 text-xs font-mono w-fit font-bold border">
                    Bet: {player.bet}
                  </div>
                </div>
              )}
              {isMe && player && gameState.status === "playing" && (
                <div className="flex space-x-4">
                  <Button
                    onClick={() => {
                      blackjackSend({
                        type: "hit",
                        data: {},
                      });
                    }}
                    size="sm"
                    className="bg-green-400 text-black hover:bg-green-500 cursor-pointer rounded-lg"
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
                    className="bg-red-400 text-black hover:bg-red-500 cursor-pointer rounded-lg"
                  >
                    Stand
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
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
          const rotationAngle =
            Math.atan2(centerY - y, x) * (180 / Math.PI) - 90;
          const isMe = mySeat === i + 1;
          const player = gameState.players[i + 1];

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
              <DeckOfCards
                cards={Array.from({ length: 2 }).map(() => getRandomCard())}
                extraDelay={i * 0.6}
              />
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
                        type: "playerJoin",
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
                {/* {isMe ? (
                  <Button
                    onClick={() => {}}
                    size="sm"
                    className="bg-red-400 text-black hover:bg-red-500 cursor-pointer rounded-lg"
                  >
                    Your Seat
                  </Button>
                ) : null} */}
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
                {/* {
                  // add a bet input and button , they should be side by side
                  isMe &&
                  player &&
                  (gameState.status === "betting" ||
                    gameState.status === "waiting") ? (
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Bet Amount"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="bg-transparent border rounded-md px-2 py-1 text-sm text-white w-24"
                      />
                      <Button
                        onClick={() => {
                          // handle bet submission here
                          blackjackSend({
                            type: "placeBet",
                            data: {
                              bet: betAmount,
                            },
                          });
                        }}
                        size="sm"
                        className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
                      >
                        Bet
                      </Button>
                    </div>
                  ) : null
                } */}
                {/* {
                  // add hit and stand button here
                  isMe && player && gameState.status === "playing" ? (
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => {
                          blackjackSend({
                            type: "hit",
                            data: {},
                          });
                        }}
                        size="sm"
                        className="bg-green-400 text-black hover:bg-green-500 cursor-pointer rounded-lg"
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
                        className="bg-red-400 text-black hover:bg-red-500 cursor-pointer rounded-lg"
                      >
                        Stand
                      </Button>
                    </div>
                  ) : null
                } */}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export { PlayerLayout };
