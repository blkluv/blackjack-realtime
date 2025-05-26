import { cn } from '@/lib/utils';
import type { FC, ReactElement } from 'react';

const rankMap: { [key: string]: string } = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  T: '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
  A: 'A',
};

const suitMap: { [key: string]: ReactElement } = {
  c: (
    <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon ">
      <path d="M14.022 50.698.398 36.438A1.47 1.47 0 0 1 0 35.427c0-.395.152-.751.398-1.012l13.624-14.268c.249-.257.59-.417.967-.417.378 0 .718.16.967.417l13.625 14.268c.245.26.397.617.397 1.012 0 .396-.152.752-.397 1.013L15.957 50.698c-.25.257-.59.416-.968.416s-.718-.16-.967-.416Zm34.022 0L34.41 36.438a1.471 1.471 0 0 1-.398-1.012c0-.395.152-.751.398-1.012l13.633-14.268c.248-.257.589-.417.967-.417s.718.16.967.417l13.624 14.268c.246.26.398.617.398 1.012 0 .396-.152.752-.398 1.013L49.978 50.698c-.249.257-.59.416-.967.416-.378 0-.719-.16-.968-.416ZM44.541 62h.01c.685 0 1.239-.58 1.239-1.296 0-.36-.14-.686-.367-.92L32.871 46.657a1.206 1.206 0 0 0-.871-.375h-.04L27.335 62h17.207ZM32.963 32.965l13.624-14.25a1.47 1.47 0 0 0 .398-1.012 1.47 1.47 0 0 0-.398-1.013L32.963 2.422a1.334 1.334 0 0 0-.97-.422h-.03L26.51 16.229l5.455 17.156h.03c.38 0 .72-.16.968-.42Z" />
      <path d="M31.028 2.424 17.404 16.683c-.245.26-.397.616-.397 1.012s.152.752.397 1.012l13.624 14.26c.24.253.568.412.934.421L31.963 2a1.33 1.33 0 0 0-.935.424Zm-12.45 57.36c-.228.234-.368.56-.368.92 0 .717.554 1.296 1.238 1.296h12.515l-.002-15.718c-.33.008-.625.15-.841.375L18.576 59.784Z" />
    </svg>
  ), // Clubs
  d: (
    <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon ">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m37.036 2.1 24.875 24.865a7.098 7.098 0 0 1 2.09 5.04c0 1.969-.799 3.75-2.09 5.04L37.034 61.909a7.076 7.076 0 0 1-5.018 2.078c-.086 0-.174 0-.25-.004v.004h-.01a7.067 7.067 0 0 1-4.79-2.072L2.089 37.05A7.098 7.098 0 0 1 0 32.009c0-1.97.798-3.75 2.09-5.04L26.965 2.102v.002A7.07 7.07 0 0 1 31.754.02l.002-.004h-.012c.088-.002.176-.004.264-.004A7.08 7.08 0 0 1 37.036 2.1Z"
      />
    </svg>
  ), // Diamonds
  h: (
    <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon ">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30.907 55.396.457 24.946v.002A1.554 1.554 0 0 1 0 23.843c0-.432.174-.82.458-1.104l14.13-14.13a1.554 1.554 0 0 1 1.104-.458c.432 0 .821.175 1.104.458l14.111 14.13c.272.272.645.443 1.058.453l.1-.013h.004a1.551 1.551 0 0 0 1.045-.452l14.09-14.09a1.554 1.554 0 0 1 1.104-.457c.432 0 .82.174 1.104.457l14.13 14.121a1.557 1.557 0 0 1 0 2.209L33.114 55.396v-.002c-.27.268-.637.438-1.046.452v.001h.003a.712.712 0 0 1-.04.002h-.029c-.427 0-.815-.173-1.095-.453Z"
      />
    </svg>
  ), // Hearts
  s: (
    <svg fill="currentColor" viewBox="0 0 64 64" className="svg-icon ">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M63.256 30.626 33.082.452A1.526 1.526 0 0 0 31.994 0c-.024 0-.048 0-.072.002h.004v.002a1.53 1.53 0 0 0-1.034.45V.452L.741 30.604a1.54 1.54 0 0 0-.45 1.09c0 .426.172.81.45 1.09l14.002 14.002c.28.278.663.45 1.09.45.426 0 .81-.172 1.09-.45l13.97-13.97a1.53 1.53 0 0 1 1.031-.45h.002l.027-.001.031-.001c.424 0 .81.172 1.088.452l14.002 14.002c.28.278.664.45 1.09.45.426 0 .81-.172 1.09-.45l14.002-14.002a1.546 1.546 0 0 0 0-2.192v.002ZM45.663 64H18.185a.982.982 0 0 1-.692-1.678L31.23 48.587h-.002a.986.986 0 0 1 .694-.285h.002v.047l.01-.047a.98.98 0 0 1 .686.285l13.736 13.736A.982.982 0 0 1 45.663 64Z"
      />
    </svg>
  ), // Spades
};

const suitColors: { [key: string]: string } = {
  c: 'text-zinc-100',
  d: 'text-red-400',
  h: 'text-red-400',
  s: 'text-zinc-100',
};

type TPlayingCardProps = {
  card: string; // e.g., "Ac", "Th", "2c"
  size?: TPlayingCardSize;
  className?: string;
  state?: EPlayingCardState;
  style?: React.CSSProperties;
};

export type TPlayingCardSize = 'sm' | 'md' | 'lg';

export enum EPlayingCardState {
  winner = 'border-green-500 border-2 lg:border-4',
  loser = 'border-red-500 border-2 lg:border-4',
  default = 'border-zinc-800 border-2 lg:border-4',
  blackjack = 'border-yellow-500 border-2 lg:border-4',
  focus = 'border-sky-500 border-2 lg:border-4',
}

const PlayingCard: FC<TPlayingCardProps> = ({
  card,
  className,
  size = 'md',
  state = EPlayingCardState.default,
  style,
}) => {
  const flipped = card === '**';
  const rank = card.slice(0, card.length - 1);
  const suit = card.slice(-1);
  const displayRank = rankMap[rank];
  const displaySuit = suitMap[suit];
  const cardSizeMap: { [key in TPlayingCardSize]: number } = {
    sm: 0.6,
    md: 1,
    lg: 1.4,
  };
  const cardSize = cardSizeMap[size as TPlayingCardSize];
  const colorClass = suitColors[suit];
  return (
    <div
      className={cn(
        'bg-zinc-900 aspect-[2/3] flex flex-col border rounded h-[8dvw] min-h-12',
        state,
        className,
      )}
      style={{
        // scale: cardSize,
        ...style,
      }}
    >
      {flipped ? (
        <div className="w-full h-full p-1 lg:p-2">
          <div className="bg-zinc-800 h-full w-full rounded flex items-center justify-center">
            <div className="text-[0.8dvw] -rotate-45 text-zinc-500 uppercase font-serif">
              DASH
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col pt-[0.2dvw] space-y-[0.4dvw]">
          <div
            className={cn('font-bold text-[1.5dvw] pl-[0.5dvw]', colorClass)}
          >
            {displayRank}
          </div>
          <div className={cn('w-[2.4dvw] px-[0.2dvw]', colorClass)}>
            {displaySuit}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayingCard;
