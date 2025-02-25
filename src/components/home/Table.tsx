import { partyKitAtom } from '@/atoms/atom';
import { timeStateAtom } from '@/atoms/time.atom';
import PlayerDeck from '@/components/home/PlayerDeck';
import PlayingCard from '@/components/home/PlayingCard';
import { useBlackjack } from '@/hooks/useBlackjack';
import { useWindowSize } from '@/hooks/useWindowSize';
import { cn, truncateAddress } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import { LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { nanoid } from 'nanoid';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { PlayerState } from '../../../party/blackjack/blackjack.types';

const FiveIconMap = [
  { src: 'fire.png', border: 'border-[#FF6C0A]', text: 'text-[#FF6C0A]' },
  { src: 'water.png', border: 'border-[#0593FF]', text: 'text-[#0593FF]' },
  { src: 'wind.png', border: 'border-[#00FFD5]', text: 'text-[#00FFD5]' },
  { src: 'lightning.png', border: 'border-[#EFFF00]', text: 'text-[#EFFF00]' },
  { src: 'leaf.png', border: 'border-[#41A851]', text: 'text-[#41A851]' },
];

const Table = () => {
  const length = 5;
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width } = useWindowSize();
  const { mySeat, gameState } = useBlackjack();
  const { state, userId } = useAtomValue(timeStateAtom);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: offsetWidth,
          height: offsetHeight,
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full w-full outline-4 outline-zinc-950 p-10 rounded-full bg-amber-950 relative">
      <Image
        src={'/wood.png'}
        alt=""
        layout="fill"
        objectFit="cover"
        quality={100}
        className="brightness-[35%] rounded-full"
      />
      <div
        ref={containerRef}
        className="w-full h-full bg-zinc-950 outline-4 outline-amber-800 flex items-center justify-center rounded-full border border-zinc-800 relative"
      >
        <Image
          src={'/bg.png'}
          alt=""
          width={2000}
          height={2000}
          quality={100}
          className="w-full h-full object-cover rounded-full brightness-75 absolute"
        />
        <Dealer />
        {Array.from({ length: 5 }).map((text, index) => {
          const size = width < 1024 ? 70 : width < 1280 ? 100 : 126;
          const startAngle = dimensions.width > dimensions.height ? -7 : 0;
          const angle =
            -index * (360 / length) -
            (dimensions.width > dimensions.height ? 120 : 90) +
            startAngle;
          const angleRad = (angle * Math.PI) / 180;

          const radiusX = dimensions.width / 2 - size;
          const radiusY = dimensions.height / 2 - size;

          const x = dimensions.width / 2 + radiusX * Math.cos(angleRad);
          const y = dimensions.height / 2 + radiusY * Math.sin(angleRad);

          const tangentAngle =
            Math.atan2(
              radiusX * Math.sin(angleRad),
              radiusY * Math.cos(angleRad),
            ) *
            (180 / Math.PI);

          const isMe = mySeat === index + 1;
          const player = gameState.players[index + 1];
          // const isCurrentTurn =
          //   gameState.status === "playing" &&
          //   player?.userId ===
          //     gameState.playerOrder[gameState.currentPlayerIndex];
          const isCurrentTurn =
            state === 'playerTimerStart' && userId === player?.userId;
          const cards = player?.hand;
          const isJoinGame = mySeat === -1 && !player;

          return (
            <div
              key={nanoid()}
              className="absolute size-16 flex items-center justify-center"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: `translate(-50%, -50%) rotate(${tangentAngle}deg)`,
              }}
            >
              <span
                className="size-full flex items-center justify-center text-white"
                style={{
                  transform: `rotate(${-tangentAngle}deg)`,
                }}
              >
                <div
                  className={cn(
                    'lg:size-48 relative border-6 border-dashed border-zinc-400 xl:bottom-6 xl:size-64 rounded-full aspect-square',
                    // `${FiveColorMap[index]}`,
                    player &&
                      `border-6 ${FiveIconMap[index]?.border} border-dashed`,
                    isCurrentTurn &&
                      `border-6 ${FiveIconMap[index]?.border} border-dashed animate-pulse`,
                  )}
                >
                  {isJoinGame ? (
                    <JoinGame index={index} />
                  ) : (
                    <InGame
                      index={index}
                      player={player}
                      cards={cards}
                      isMe={isMe}
                    />
                  )}
                </div>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Table;

const EmtpyDeck = () => {
  const { width } = useWindowSize();
  // const size: TPlayingCardSize = width < 1280 ? "sm" : "md";
  return (
    <div className="flex rotate-90 flex-col">
      <PlayingCard card="**" size={width > 1280 ? 'md' : 'sm'} />
      <PlayingCard
        card="**"
        size={width > 1280 ? 'md' : 'sm'}
        className="absolute bottom-4 left-4 hidden xl:bloc"
      />
    </div>
  );
};

const Dealer = () => {
  const { gameState } = useBlackjack();
  const cards = gameState.dealerHand;
  // const cards = ["Tc", "2d"];
  return (
    <div className="relative top-[2dvh] xl:top-[-8dvh] flex flex-col">
      <EmtpyDeck />
      {cards.length > 0 && (
        <div className="relative left-1 xl:left-5 bottom-[4dvh] xl:top-[dvh]">
          <PlayerDeck cards={cards} walletAddress="0xGawkGawk" dealer />
        </div>
      )}
    </div>
  );
};

const JoinGame = ({ index }: { index: number }) => {
  const [isHovering, setIsHovering] = useState(false);
  const { mySeat, blackjackSend, gameState } = useBlackjack();
  return (
    <motion.div
      whileTap={{ scale: 0.95, backdropFilter: 'brightness(0.50)' }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      onClick={() => {
        console.log('joining game');
        blackjackSend({
          type: 'playerJoin',
          data: {
            seat: index + 1,
          },
        });
      }}
      className="w-full rounded-full space-x-2 transition duration-300 hover:backdrop-brightness-75 cursor-pointer h-full flex items-center justify-center"
    >
      <motion.div
        layout
        initial={{
          width: '6rem',
        }}
        animate={{
          scale: 1,
          width: isHovering ? '3rem' : '6rem',
        }}
        // className="grayscale-100"
      >
        <Image
          src={`/${FiveIconMap[index]?.src}`}
          alt=""
          height={500}
          width={500}
          className="size-full grayscale-100"
        />
      </motion.div>
      <AnimatePresence mode="popLayout">
        {isHovering && (
          <motion.div
            layout
            key={'join'}
            initial={{
              x: 30,
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: 30,
              opacity: 0,
            }}
            className="origin-left"
          >
            Join Game
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const InGame = ({
  index,
  player,
  cards,
  isMe,
}: {
  index: number;
  player?: PlayerState;
  cards?: string[];
  isMe: boolean;
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const party = useAtomValue(partyKitAtom);
  const handleExit = () => {
    // TODO: leave game
    if (!party) return;
    party.close();
    console.log(party.readyState);
    console.log('closing');
  };
  return (
    <motion.div
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className={cn(
        'w-full relative rounded-full space-x-2 h-full flex items-center justify-center',
      )}
    >
      <div className="lg:w-16 xl:w-24 flex flex-col space-y-3 w-full">
        <div className="flex space-x-2 w-full">
          <AnimatePresence mode="popLayout">
            {(!isHovering || !isMe) && (
              <motion.div
                key="icons"
                initial={{
                  x: 0,
                }}
                animate={{
                  x: 0,
                }}
                exit={{
                  x: isMe ? -30 : 0,
                  opacity: isMe ? 0 : 1,
                }}
                // transition={{
                //   duration: 0.6,
                // }}
              >
                <Image
                  src={`/${FiveIconMap[index]?.src}`}
                  alt=""
                  height={500}
                  width={500}
                  className={cn('size-full', {
                    'grayscale-100': !player,
                  })}
                />
              </motion.div>
            )}

            {isHovering && isMe && (
              <motion.div
                layout
                key={'join'}
                initial={{
                  x: 30,
                }}
                animate={{
                  x: 0,
                }}
                exit={{
                  x: 30,
                  opacity: 0,
                }}
                onClick={handleExit}
                className="flex space-x-2 cursor-pointer justify-center w-full lg:my-4 xl:my-5.5 items-center"
              >
                {/* <div className="whitespace-nowrap text-center">Leave</div> */}
                <LogOut
                  className={cn(
                    FiveIconMap[index]?.text,
                    'lg:size-8 xl:size-13',
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {player && cards?.length === 0 && (
          <div className="text-xs w-fit px-2 self-center bg-zinc-950/30 rounded-full py-0.5 font-mono text-center text-zinc-200">
            {isMe ? 'You' : truncateAddress(player.userId)}
          </div>
        )}
      </div>
      <div className="lg:absolute top-0 left-0 w-full">
        {player && cards && cards.length > 0 && (
          <PlayerDeck
            cards={cards}
            bet={player.bet}
            walletAddress={player.userId}
          />
        )}
      </div>
    </motion.div>
  );
};
