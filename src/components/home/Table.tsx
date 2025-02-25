import PlayerDeck from '@/components/home/PlayerDeck';
import PlayingCard from '@/components/home/PlayingCard';
import { useBlackjack } from '@/hooks/useBlackjack';
import { useWindowSize } from '@/hooks/useWindowSize';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { nanoid } from 'nanoid';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const FiveColorMap = [
  'bg-red-800',
  'bg-green-800',
  'bg-blue-800',
  'bg-yellow-800',
  'bg-purple-800',
];

const FiveTextMap = ['A', 'B', 'C', 'D', 'E'];

const Table = () => {
  const length = 5;
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width } = useWindowSize();
  const { mySeat, blackjackSend, gameState } = useBlackjack();

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
    <div
      ref={containerRef}
      className="w-full h-full outline-4 outline-zinc-900 bg-zinc-950 flex items-center justify-center rounded-full border border-zinc-800 relative"
    >
      <Image
        src={'/green.jpg'}
        alt=""
        width={1000}
        height={700}
        className="w-full h-full object-cover rounded-full brightness-75 opacity-50 absolute"
      />
      <Dealer />
      {Array.from({ length: 5 }).map((text, index) => {
        const size = width < 1024 ? 70 : width < 1280 ? 100 : 126;
        const startAngle = dimensions.width > dimensions.height ? -7 : 0;
        const angle =
          index * (360 / length) -
          (dimensions.width > dimensions.height ? 120 : 90) +
          startAngle;
        // index * (360 / texts.length) -
        //   (dimensions.width > dimensions.height ? -225 : 90);
        const angleRad = (angle * Math.PI) / 180;

        const radiusX = dimensions.width / 2 - size; // size
        const radiusY = dimensions.height / 2 - size;

        const x = dimensions.width / 2 + radiusX * Math.cos(angleRad);
        const y = dimensions.height / 2 + radiusY * Math.sin(angleRad);

        const tangentAngle =
          Math.atan2(
            radiusX * Math.sin(angleRad),
            radiusY * Math.cos(angleRad),
          ) *
          (180 / Math.PI);

        //logics
        const isMe = mySeat === index + 1;
        const player = gameState.players[index + 1];
        const isCurrentTurn =
          gameState.status === 'playing' &&
          player?.userId ===
            gameState.playerOrder[gameState.currentPlayerIndex];
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
                  'lg:size-48 relative outline-4 outline-zinc-900 xl:bottom-4 xl:size-64 rounded-full aspect-square',
                  `${FiveColorMap[index]}`,
                )}
              >
                {isJoinGame ? (
                  <JoinGame index={index} />
                ) : (
                  <div className="w-full relative rounded-full space-x-2 h-full flex items-center justify-center">
                    <div className="text-9xl opacity-25 hidden lg:block">
                      {FiveTextMap[index]}
                    </div>
                    <div className="lg:absolute top-0 left-0 w-full">
                      {cards && cards.length > 0 && (
                        <PlayerDeck
                          cards={cards}
                          bet={player.bet}
                          walletAddress={player.userId}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </span>
          </div>
        );
      })}
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
          fontSize: '4.5rem',
        }}
        animate={{
          scale: 1,
          fontSize: isHovering ? '2rem' : '4.5rem',
        }}
        // className="text-7xl"
      >
        {FiveTextMap[index]}
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
