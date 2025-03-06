import { dealerCardsAtom, playerCardsAtom } from '@/atoms/cards.atom';
import { deckPositionAtom } from '@/atoms/deck.atom';
import { rulesAtom } from '@/atoms/rules.atom';
import { timeStateAtom } from '@/atoms/time.atom';
import PlayingCard, { EPlayingCardState } from '@/components/home/PlayingCard';
import { useBlackjack } from '@/hooks/useBlackjack';
import { useWindowSize } from '@/hooks/useWindowSize';
// import { LG_VIEWPORT, XL_VIEWPORT } from "@/lib/constants";
import { cn, truncateAddress } from '@/lib/utils';
import { useLocalPeer } from '@huddle01/react';
import { useLocalAudio, useRemoteAudio } from '@huddle01/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DoorOpen, MicIcon, MicOffIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { nanoid } from 'nanoid';
import Image from 'next/image';
import { type FC, memo, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  PLAYER_TURN_PERIOD,
  type PlayerState,
  type RoundResultState,
} from '../../../../party/blackjack/blackjack.types';
import { ESoundType, playSound } from '../Utils/sound';
import PlayerDeck from './PlayerDeck';
// import { useRemoteAudio } from "@huddle01/react";

const GodsMap = [
  {
    src: '/images/gods/1.png',
    border: 'border-[#C63F3D]',
    text: 'text-[#C63F3D]',
    bg: 'bg-[#C63F3D]',
  },
  {
    src: '/images/gods/2.png',
    border: 'border-[#3CA89C]',
    text: 'text-[#3CA89C]',
    bg: 'bg-[#3CA89C]',
  },
  {
    src: '/images/gods/3.png',
    border: 'border-[#6251C8]',
    text: 'text-[#6251C8]',
    bg: 'bg-[#6251C8]',
  },
  {
    src: '/images/gods/4.png',
    border: 'border-[#CE4471]',
    text: 'text-[#CE4471]',
    bg: 'bg-[#CE4471]',
  },
  {
    src: '/images/gods/5.png',
    border: 'border-[#FD994E]',
    text: 'text-[#FD994E]',
    bg: 'bg-[#FD994E]',
  },
];

const Table = memo(() => {
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
        className="w-full h-full bg-zinc-950 outline-4 outline-amber-900 flex items-center justify-center rounded-full border border-zinc-800 relative"
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
          const size = width / 12;
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
          const isCurrentTurn =
            state === 'playerTimerStart' && userId === player?.userId;
          const cards = player?.hand;
          const isJoinGame = mySeat === -1 && !player;
          const result = player?.roundResult?.state;

          if ((result === 'win' || result === 'blackjack') && isMe) {
            playSound(ESoundType.WIN, { volume: 0.5 });
          }

          if (result === 'loss' && isMe) {
            playSound(ESoundType.LOSE, { volume: 0.5 });
          }

          const getResultColor = (): string => {
            if (!result) return '';
            switch (result) {
              case 'win':
                return ' animate-none outline-green-500';
              case 'loss':
                return ' animate-none outline-red-500';
              case 'blackjack':
                return 'outline-yellow-500 animate-none';
              default:
                return '';
            }
          };

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
                <BorderTimer
                  offset={
                    dimensions.width > dimensions.height ? width / -70 : 0
                  }
                  width={width}
                  userId={player?.userId}
                >
                  <div
                    className={cn(
                      'relative size-[14dvw] border-2 border-zinc-400 rounded-full aspect-square',
                      player &&
                        'border-6 border-zinc-300 border-dashed outline-3 outline-zinc-300',
                      isCurrentTurn && 'border-none outline-none',
                      getResultColor(),
                    )}
                    style={{
                      top:
                        dimensions.width > dimensions.height ? width / -70 : 0,
                    }}
                  >
                    {isJoinGame ? (
                      <JoinGame index={index} />
                    ) : (
                      <InGame
                        index={index}
                        player={player}
                        cards={cards}
                        isMe={isMe}
                        isCurrentTurn={isCurrentTurn}
                        state={result}
                      />
                    )}
                  </div>
                </BorderTimer>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default Table;

type TBorderTimerProps = {
  children: React.ReactNode;
  offset?: number;
  width: number;
  userId: string | undefined;
};

const BorderTimer: FC<TBorderTimerProps> = ({
  children,
  offset = 0,
  width,
  userId: user,
}) => {
  const { state, userId } = useAtomValue(timeStateAtom);
  const duration = PLAYER_TURN_PERIOD;
  const isActive = state === 'playerTimerStart' && userId === user;

  if (!isActive) return <>{children}</>;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ top: offset }}
    >
      <svg
        className="absolute inset-0 w-full h-full rotate-[-90deg]"
        viewBox="0 0 100 100"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
          stroke="yellow"
          strokeWidth={width / 800}
          strokeDasharray="282.74"
          strokeDashoffset="0"
          // initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: 282.74 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      </svg>
      <div className="p-[1dvw] relative" style={{ bottom: offset }}>
        {children}
      </div>
    </div>
  );
};

const EmtpyDeck = () => {
  const { width, height } = useWindowSize();
  const setPosition = useSetAtom(deckPositionAtom);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to update position
    const updatePosition = () => {
      if (divRef.current) {
        const rect = divRef.current.getBoundingClientRect();
        setPosition({
          x: rect.left,
          y: rect.top,
          viewportX: rect.left / window.innerWidth,
          viewportY: rect.top / window.innerHeight,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Update position initially
    updatePosition();

    // Update position on scroll and resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    // Clean up
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [setPosition]);

  return (
    <div ref={divRef} className="z-20 rotate-90">
      <PlayingCard card="**" size={width > 1280 ? 'md' : 'sm'} />
    </div>
  );
};

const Dealer = memo(() => {
  const { gameState } = useBlackjack();
  const cards = gameState.dealerHand;
  const [dealerPrevCards, setDealerPrevCards] = useAtom(dealerCardsAtom);
  const [cardsToAnimate, setCardsToAnimate] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!cards || cards.length === 0) {
      setDealerPrevCards([]);
      setCardsToAnimate(new Set());
      return;
    }

    const newCards = cards.filter((card, index) => {
      if (index === 1 && dealerPrevCards[1] === '**') {
        return card !== '**';
      }
      return !dealerPrevCards.includes(card);
    });

    if (newCards.length > 0) {
      setCardsToAnimate(new Set(newCards));
    } else {
      setCardsToAnimate(new Set());
    }

    setDealerPrevCards([...cards]);
  }, [cards, setDealerPrevCards]);

  const calculateDealerDelay = () => {
    const playerCount = gameState.playerOrder.length;
    return playerCount * 0.6; // 0.6 seconds per card
  };

  const calculateTotalPlayerDelay = () => {
    const playerCount = gameState.playerOrder.length;
    return playerCount * 1.4; // 1.4 seconds per player
  };

  useEffect(() => {
    if (cardsToAnimate.size > 0) {
      const timer = setTimeout(
        () => {
          setCardsToAnimate(new Set());
        },
        (calculateDealerDelay() + calculateTotalPlayerDelay()) * 1000,
      );

      return () => clearTimeout(timer);
    }
  }, [cardsToAnimate]);

  return (
    <div className="relative top-[2dvh] xl:top-[-8dvh] flex flex-col">
      <EmtpyDeck />
      {cards.length > 0 && gameState.playerOrder.length > 0 && (
        <div className="relative left-1 xl:left-5 bottom-[4dvh] xl:top-[dvh]">
          <PlayerDeck
            cards={cards}
            walletAddress="0xDealer"
            dealer
            index={gameState.playerOrder.length + 1}
            animateCards={cardsToAnimate}
            dealerDelay={calculateTotalPlayerDelay()}
          />
        </div>
      )}
    </div>
  );
});

const JoinGame = memo(({ index }: { index: number }) => {
  const [isHovering, setIsHovering] = useState(false);
  const { blackjackSend } = useBlackjack();
  const [isOpen, setIsOpen] = useAtom(rulesAtom);
  const { peerId } = useLocalPeer();
  const { width, q } = useWindowSize();

  const joinGame = () => {
    console.log('joining game');
    if (!peerId) {
      toast.error('Connection to VoiceChat failed! , Please Reload the page');
      return;
    }
    blackjackSend({
      type: 'playerJoin',
      data: {
        seat: index + 1,
        huddle01PeerId: peerId,
      },
    });
    playSound(ESoundType.JOIN, { volume: 0.5 });
    const hasSeenRules = localStorage.getItem('hasSeenRules');
    if (!isOpen && !hasSeenRules) setIsOpen(true);
  };
  return (
    <motion.div
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      onClick={joinGame}
      className={cn(
        'w-full h-full rounded-full cursor-pointer space-y-2 flex flex-col items-center justify-center overflow-hidden',
        GodsMap[index]?.bg,
      )}
    >
      <motion.div
        animate={{
          width: isHovering ? q / 20 : '100%',
          height: isHovering ? q / 20 : '100%',
        }}
        className="rounded-full"
      >
        <Image
          src={GodsMap[index]?.src || ''}
          alt=""
          height={500}
          width={500}
          className={cn('size-full rounded-full')}
        />
      </motion.div>
      <AnimatePresence mode="popLayout">
        {isHovering && (
          <motion.div
            layout
            key={'join'}
            initial={{
              y: 30,
            }}
            animate={{
              y: 0,
            }}
            exit={{
              y: 30,
              opacity: 0,
            }}
            className="origin-left text-[1dvw] whitespace-nowrap text-zinc-200 uppercase font-semibold font-serif"
          >
            Join game
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

type TInGameProps = {
  index: number;
  player?: PlayerState;
  cards?: string[];
  isMe: boolean;
  state?: RoundResultState;
  isCurrentTurn: boolean;
};

const InGame: FC<TInGameProps> = memo(
  ({ index, player, cards, isMe, state, isCurrentTurn }) => {
    const [isHovering, setIsHovering] = useState(false);
    const { blackjackSend, gameState } = useBlackjack();
    const [playerCardStates, setPlayerCardStates] = useAtom(playerCardsAtom);
    const [cardsToAnimate, setCardsToAnimate] = useState<Set<string>>(
      new Set(),
    );
    const { isAudioOn: isRemoteAudioOn } = useRemoteAudio({
      peerId: player?.huddle01PeerId ?? '',
    });
    const { isAudioOn: isLocalAudioOn } = useLocalAudio();

    useEffect(() => {
      if (!player) return;

      const userId = player.userId;
      const prevCards = playerCardStates[userId] || [];

      if (!cards || cards.length === 0) {
        setPlayerCardStates((prev) => ({ ...prev, [userId]: [] }));
        setCardsToAnimate(new Set());
        return;
      }

      const newCards = cards.filter((card) => !prevCards.includes(card));

      if (newCards.length > 0) {
        setCardsToAnimate(new Set(newCards));
      } else {
        setCardsToAnimate(new Set());
      }

      setPlayerCardStates((prev) => ({ ...prev, [userId]: [...cards] }));
    }, [cards, player, setPlayerCardStates]);

    // useEffect(() => {
    //   if (cardsToAnimate.size > 0) {
    //     const timer = setTimeout(() => {
    //       setCardsToAnimate(new Set());
    //     }, 3000);

    //     return () => clearTimeout(timer);
    //   }
    // }, [cardsToAnimate]);

    const handleExit = () => {
      blackjackSend({ type: 'leave', data: {} });
      console.log('closing');
      playSound(ESoundType.EXIT, { volume: 0.25 });
    };

    const getState = (): EPlayingCardState => {
      if (isCurrentTurn) return EPlayingCardState.focus;
      if (player?.hasBusted) return EPlayingCardState.loser;
      switch (state) {
        case 'win':
          return EPlayingCardState.winner;
        case 'loss':
          return EPlayingCardState.loser;
        case 'blackjack':
          return EPlayingCardState.blackjack;
        default:
          return EPlayingCardState.default;
      }
    };

    const memoizedPlayerDeck = useMemo(() => {
      if (!player) return null;
      // console.log("old: ", cards);
      // console.log("new ", cardsToAnimate);
      return (
        cards &&
        cards.length > 0 && (
          <PlayerDeck
            index={gameState.playerOrder.indexOf(player.userId)}
            cards={cards}
            bet={player.bet}
            walletAddress={player.userId}
            state={getState()}
            animateCards={cardsToAnimate}
          />
        )
      );
    }, [cards, player, gameState, cardsToAnimate, state]);

    return (
      <motion.div
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        className={cn(
          'w-full h-full rounded-full space-y-2 flex flex-col items-center justify-center overflow-hidden',
          GodsMap[index]?.bg,
        )}
      >
        <div className="flex">
          <AnimatePresence mode="popLayout">
            {(!isHovering || !isMe) && (
              <motion.div
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
                className={cn(
                  'rounded-full lg:size-24 xl:size-32',
                  !player && 'lg:size-48 xl:size-64 -mb-2',
                )}
              >
                {!(player && cards && cards.length > 0) && (
                  <Image
                    src={GodsMap[index]?.src || ''}
                    alt=""
                    height={500}
                    width={500}
                    className={cn('size-full rounded-full')}
                  />
                )}
              </motion.div>
            )}
            {isHovering && isMe && !(player && cards && cards.length > 0) && (
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
                className="flex flex-col cursor-pointer justify-center w-full lg:my-3 xl:my-4 items-center"
              >
                <DoorOpen className={cn('lg:size-14 xl:size-20 text-white')} />
                <div className="whitespace-nowrap text-center text-sm">
                  Leave
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {player && cards?.length === 0 && (
          <div className="flex space-x-2">
            <div className="text-xs w-fit px-2 self-center bg-zinc-950/30 rounded-full py-0.5 font-mono text-center text-zinc-200">
              {isMe ? 'You' : truncateAddress(player.userId)}
            </div>
            <div className="text-xs w-fit px-2 self-center bg-zinc-950/30 rounded-full py-0.5 font-mono text-center text-zinc-200">
              {isMe ? (
                isLocalAudioOn ? (
                  <MicIcon size={14} />
                ) : (
                  <MicOffIcon size={14} />
                )
              ) : isRemoteAudioOn ? (
                <MicIcon size={14} />
              ) : (
                <MicOffIcon size={14} />
              )}
              {isMe ? (
                isLocalAudioOn ? (
                  <MicIcon size={14} />
                ) : (
                  <MicOffIcon size={14} />
                )
              ) : isRemoteAudioOn ? (
                <MicIcon size={14} />
              ) : (
                <MicOffIcon size={14} />
              )}
            </div>
          </div>
        )}
        {player && (
          <div className="absolute top-0 left-0 w-full">
            {memoizedPlayerDeck}
            <GTAOverlay player={player} />
          </div>
        )}
      </motion.div>
    );
  },
);

const GTAOverlay = ({ player }: { player: PlayerState }) => {
  const playerBet = player.roundResult?.bet;
  const result = player.roundResult?.state;
  if (!result || !playerBet) return null;
  const value =
    result === 'win'
      ? `+${playerBet}`
      : result === 'blackjack'
        ? `+${playerBet * 1.5}`
        : `-${playerBet}`;

  const getColor = () => {
    if (!result) return '';
    switch (result) {
      case 'win':
        return 'text-green-400';
      case 'loss':
        return 'text-red-400';
      case 'blackjack':
        return 'text-yellow-400';
      default:
        return '';
    }
  };

  return (
    <div className="absolute aspect-square rounded-full flex items-center justify-center top-0 left-0 w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black to-transparent">
      <div className={cn('text-[3dvw] font-serif font-black', getColor())}>
        {value}
      </div>
    </div>
  );
};
