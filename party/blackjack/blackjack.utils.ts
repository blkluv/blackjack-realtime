import type { Card } from './blackjack.types';

/**
 * Create and shuffle a standard 52-card deck using our scheme.
 */
function createDeck(): Card[] {
  const ranks = [
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
  const suits = ['c', 'd', 'h', 's'];
  const deck: Card[] = [];
  for (const r of ranks) {
    for (const s of suits) {
      deck.push(`${r}${s}`);
    }
  }
  // Shuffle with Fisher–Yates algorithm.
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // @ts-ignore: false positive on tuple swap
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/**
 * Compute the best blackjack hand value.
 * Since cards are represented as "rank+suit", we extract the rank
 * using card.slice(0, 1). (This works because all ranks are one character,
 * with "T" meaning 10.)
 */
function handValue(hand: Card[]): { value: number; isSoft: boolean } {
  let sum = 0;
  let aces = 0;
  for (const card of hand) {
    const r = card.slice(0, 1);
    if (r === 'A') {
      aces++;
      sum += 1;
    } else if (['K', 'Q', 'J', 'T'].includes(r)) {
      sum += 10;
    } else {
      sum += Number.parseInt(r, 10);
    }
  }

  let isSoft = false;
  // Upgrade aces if possible.
  while (aces > 0 && sum + 10 <= 21) {
    sum += 10;
    aces--;
    isSoft = true; // Hand is soft if we upgrade an Ace
  }

  return { value: sum, isSoft };
}

function getCardName(card: Card): string {
  const rank = card.slice(0, 1);
  const suit = card.slice(1);
  const suitName =
    suit === 'c'
      ? 'Clubs'
      : suit === 'd'
        ? 'Diamonds'
        : suit === 'h'
          ? 'Hearts'
          : 'Spades';
  const rankName =
    rank === 'A'
      ? 'Ace'
      : rank === 'T'
        ? 'Ten'
        : rank === 'J'
          ? 'Jack'
          : rank === 'Q'
            ? 'Queen'
            : rank === 'K'
              ? 'King'
              : rank;
  return `${rankName} of ${suitName}`;
}

export { createDeck, handValue, getCardName };
