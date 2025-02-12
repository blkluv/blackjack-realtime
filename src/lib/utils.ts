import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getRandomCard = (): string => {
  const rank = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'T',
    'J',
    'Q',
    'K',
    'A',
  ];
  const suit = ['c', 'd', 'h', 's'];

  const randomRank = rank[Math.floor(Math.random() * rank.length)];
  const randomSuit = suit[Math.floor(Math.random() * suit.length)];

  return (randomRank ?? '2') + (randomSuit ?? 'c');
};

export const truncateAddress = (text: string | undefined) => {
  if (!text) return '';
  return `${text.slice(0, 4)}...${text.slice(-4)}`;
};
