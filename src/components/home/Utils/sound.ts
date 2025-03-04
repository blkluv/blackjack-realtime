export enum ESoundType {
  FLIP = 'flip',
  DEAL = 'deal',
  WIN = 'win',
  LOSE = 'lose',
  BET = 'bet',
  MUCKED = 'mucked',
  TURN = 'turn',
  JOIN = 'join',
  EXIT = 'exit',
  DING = 'ding',
}

const soundMap: Record<ESoundType, string> = {
  [ESoundType.FLIP]: '/sounds/Flip.mp3',
  [ESoundType.DEAL]: '/sounds/Deal.mp3',
  [ESoundType.WIN]: '/sounds/Win.mp3',
  [ESoundType.LOSE]: '/sounds/Lose.mp3',
  [ESoundType.BET]: '/sounds/Bet.mp3',
  [ESoundType.MUCKED]: '/sounds/Mucked.mp3',
  [ESoundType.TURN]: '/sounds/Turn.mp3',
  [ESoundType.JOIN]: '/sounds/Join.mp3',
  [ESoundType.EXIT]: '/sounds/Exit.mp3',
  [ESoundType.DING]: '/sounds/Ding.mp3',
};

type TSoundOptions = {
  volume?: number; // 0.0 (silent) and 1.0 (full volume)
};

/**
 * Play a sound by its type
 * @param soundType - The type of sound to play
 * @param options - Optional configuration including volume
 */
export const playSound = (
  soundType: ESoundType,
  options: TSoundOptions = {},
): void => {
  const { volume = 1.0 } = options;

  const safeVolume = Math.max(0, Math.min(1, volume));

  if (!soundMap[soundType]) {
    console.error(`Sound type "${soundType}" not found`);
    return;
  }

  try {
    const audio = new Audio(soundMap[soundType]);
    audio.volume = safeVolume;
    audio.play().catch((error) => {
      console.error('Failed to play sound:', error);
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};
