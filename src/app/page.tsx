"use client";
import WalletConnect from "@/components/auth/WalletConnect";
import { Button } from "@/components/ui/button";
import { useCursor } from "@/hooks/useCursor";
import useMounted from "@/hooks/useMounted";
import { usePartyKit } from "@/hooks/usePartyKit";
import { useUser } from "@/hooks/useUser";
import { useWindowSize } from "@/hooks/useWindowSize";
import { cn, getRandomCard } from "@/lib/utils";
// @ts-ignore
import Card from "@heruka_urgyen/react-playing-cards";
import { MicIcon, MicOffIcon } from "lucide-react";
import { motion } from "motion/react";
import { nanoid } from "nanoid";
import Image from "next/image";

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
              <Button
                disabled={!user.isAuthenticated}
                onClick={() => {}}
                size="sm"
                className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer rounded-lg"
              >
                Join Game
              </Button>
              <div className="flex space-x-4">
                <div className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-mono w-fit font-bold border">
                  Score: 322
                </div>
                <div className="rounded-full bg-violet-400 px-2 py-0.5 text-xs font-mono w-fit font-bold border">
                  Bet: 76$
                </div>
              </div>
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
  // console.log(cursorMap);
  return <div className="w-full h-full absolute top-0 left-0 -z-50" />;
};

export default GamePage;
