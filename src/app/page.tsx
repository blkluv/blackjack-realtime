"use client";
import WalletConnect from "@/components/auth/WalletConnect";
import { Button } from "@/components/ui/button";
import { useBlackjack } from "@/hooks/useBlackjack";
import { useCursor } from "@/hooks/useCursor";
import useMounted from "@/hooks/useMounted";
import { usePartyKit } from "@/hooks/usePartyKit";
import { useUser } from "@/hooks/useUser";
import { useWindowSize } from "@/hooks/useWindowSize";
import { cn, getRandomCard } from "@/lib/utils";
// @ts-ignore
import Card from "@heruka_urgyen/react-playing-cards";
import { MicIcon, MicOffIcon, MousePointer2 } from "lucide-react";
import { motion } from "motion/react";
import { nanoid } from "nanoid";
import Image from "next/image";
import { useState } from "react";

const GamePage = () => {
  const { readyState } = usePartyKit();

  return (
    <div className="h-screen relative w-full overflow-hidden flex flex-col items-center">
      <DealerView />
      <Background />
      <PlayerLayout />
      <ActionButtons />
      <CursorSpace />
    </div>
  );
};

const DealerView = () => {
  const { q } = useWindowSize();
  return (
    <div
      className="flex flex-col space-y-2 z-10 relative"
      style={{
        top: `${q / 16}px`,
      }}
    >
      <div>Dealer</div>
      <DeckOfCards
        cards={Array.from({ length: 2 }).map(() => getRandomCard())}
      />
    </div>
  );
};

const Background = () => {
  const { q } = useWindowSize();
  const isMounted = useMounted();
  if (!isMounted) return null;
  return (
    <>
      <Image
        alt=""
        quality={100}
        src="/bg.png"
        width={1000}
        height={1000}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div
        style={{
          width: q / 2.3,
          top: -q / 4.6,
          outlineWidth: q / 24,
          outlineColor: "#18181b",
        }}
        className="absolute rounded-full aspect-square outline border-4 border-zinc-300"
      />
      <div
        style={{
          width: q / 2.7,
          top: -q / 5.4,
        }}
        className="absolute overflow-hidden bg-emerald-950 rounded-full aspect-square border-4 border-zinc-300"
      >
        <Image
          src={"/green-noise.png"}
          alt=""
          height={1000}
          width={1000}
          quality={100}
          className="object-cover h-full w-full opacity-30"
        />
      </div>
      <div
        style={{
          width: q / 3,
          top: -q / 6,
          left: "50%",
          transform: "translateX(-50%)",
        }}
        className="absolute flex justify-center items-center overflow-hidden rounded-full aspect-square border border-zinc-300"
      />
    </>
  );
};

const DeckOfCards = ({
  cards,
  extraDelay = 0,
}: {
  cards: string[];
  extraDelay?: number;
}) => {
  const { q } = useWindowSize();
  //   const isMounted = useMounted();
  //   if (!isMounted) return null;
  return (
    <div className="relative pb-4">
      {cards.map((card, i) => (
        <div
          key={nanoid()}
          className="group"
          style={{
            position: i > 0 ? "absolute" : "relative",
            left: `${i * (q / 256) + (i > 0 ? Math.random() * 20 : 0)}px`,
            top: `${i * 0 + (i > 0 ? Math.random() * (q / 64) : 0)}px`,
            transform: `rotate(${i > 0 ? Math.random() * (q / 64) : 0}deg)`,
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <motion.div
            initial={{
              y: -q,
              rotate: 720,
            }}
            animate={{
              y: 0,
              rotate: 0,
            }}
            transition={{
              delay: extraDelay + i * 0.3,
              duration: 0.3,
            }}
            // drag
            // dragConstraints={{ top: 10, left: 10, right:10, bottom: 10 }}
            className="transform cursor-grab transition-transform duration-300 group-hover:-translate-y-4 group-hover:scale-105"
          >
            <Card
              card={card}
              deckType="basic"
              height={`${q / 16}px`}
              className="cursor-pointer"
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
};

const PlayerLayout = () => {
  const { user } = useUser();
  const { q } = useWindowSize();
  const { mySeat, blackjackSend, gameState } = useBlackjack();
  const [betAmount, setBetAmount] = useState(0);

  console.log({ mySeat });

  const numPlayers = 5;
  const curveHeight = q / 4.6;
  const radius = curveHeight + q / 15;
  const centerY = radius;
  return (
    <div
      className="absolute w-full flex justify-center"
      style={{ height: `${radius}px`, top: `${q / 96}px` }}
    >
      {Array.from({ length: numPlayers }).map((_, i) => {
        const mid = Math.floor(numPlayers / 2);
        const angleStep = Math.PI / (numPlayers + 1);
        const angle = (i - mid) * angleStep;
        const x = radius * Math.sin(angle);
        const y = centerY - radius * Math.cos(angle);
        const rotationAngle = Math.atan2(centerY - y, x) * (180 / Math.PI) - 90;
        const isMe = mySeat === i + 1;
        const player = gameState.players[i + 1];

        return (
          <div
            key={nanoid()}
            className="absolute transition-all duration-300 z-20"
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
                  className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
                >
                  Join Game
                </Button>
              ) : null}
              {isMe ? (
                <Button
                  onClick={() => { }}
                  size="sm"
                  className="bg-red-400 text-black hover:bg-red-500 cursor-pointer rounded-lg"
                >
                  Your Seat
                </Button>
              ) : null}
              {player ? (
                <div className="flex space-x-4">
                  <div className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-mono w-fit font-bold border">
                    ID:{" "}
                    {player.userId.length > 4
                      ? `${player.userId.slice(0, 4)}...`
                      : player.userId}
                  </div>
                  <div className="rounded-full bg-violet-400 px-2 py-0.5 text-xs font-mono w-fit font-bold border">
                    Bet: {player.bet}
                  </div>
                </div>
              ) : null}
              {
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
              }
              {
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
              }
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ActionButtons = () => {
  const { user } = useUser();

  return (
    <div className="flex fixed bottom-4 items-center p-4 border border-zinc-200/10 backdrop-blur-sm rounded-xl space-x-4">
      {user.isAuthenticated && (
        <>
          <Button
            onClick={() => alert("todo")}
            size="sm"
            className={cn(
              "bg-yellow-400 text-black cursor-pointer rounded-lg"
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
          {/* <Button
            size="sm"
            className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
          >
            Hit
          </Button>
          <Button
            size="sm"
            className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
          >
            Stand
          </Button>
          <Button
            size="sm"
            className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
          >
            Start Game
          </Button> */}
        </>
      )}

      {/* <Button
        size={'sm'}
        className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
        onClick={() => (!isAuthenticated && isConnected ? joinGame(2) : open())}
      >
        {isAuthenticated
          ? truncateAddress(walletAddress)
          : isConnected
            ? 'Join Game'
            : 'Connect Wallet'}
      </Button> */}
      <WalletConnect />
    </div>
  );
};

const CursorSpace = () => {
  const { cursorMap } = useCursor();
  const { height, width } = useWindowSize();
  console.log(cursorMap);
  // country: "IN";
  // id: "0";
  // lastUpdate: 1739794803807;
  // pointer: "mouse";
  // x: 0.7019027484143763;
  // y: 0.8498452012383901;
  // get key with latest updated at

  // get key with latest updated at
  const lastKey = Object.keys(cursorMap).reduce((a, b) => {
    return cursorMap[a].lastUpdate > cursorMap[b].lastUpdate ? a : b;
  });

  const lastValue = cursorMap[lastKey];
  if (!lastValue) return null;

  return (
    <div className="w-full h-full">
      <motion.div
        animate={{
          x: lastValue.x * width,
          y: lastValue.y * height - (48 * 4 - 24),
        }}
        className="text-black h-8 w-fit rounded-full relative"
      >
        <MousePointer2 className="absolute top-0 left-0 text-white" />
        <div className="pt-3 pl-5">
          {getFlagFromCountryCode(lastValue.country)}
        </div>
      </motion.div>
    </div>
  );
};

const getFlagFromCountryCode = (countryCode: string | null): string => {
  if (!countryCode) return "";

  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(0x1f1e6 - 65 + char.charCodeAt(0)))
    .join("");
};

export default GamePage;
