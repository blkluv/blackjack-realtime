'use client';

import { soundAtom } from '@/atoms/sound.atom';
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';

export enum SoundType {
  FLIP = 'flip',
  DEAL = 'deal',
  WIN = 'win',
  LOSE = 'lose',
  BET = 'bet',
  MUCKED = 'mucked',
}

const Sound = () => {
  const [currentSound, setCurrentSound] = useAtom(soundAtom);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const soundPaths: Record<SoundType, string> = {
    [SoundType.FLIP]: '/sounds/Flip.mp3',
    [SoundType.DEAL]: '/sounds/Deal.mp3',
    [SoundType.WIN]: '/sounds/Win.mp3',
    [SoundType.LOSE]: '/sounds/Lose.mp3',
    [SoundType.BET]: '/sounds/Bet.mp3',
    [SoundType.MUCKED]: '/sounds/Mucked.mp3',
  };

  useEffect(() => {
    if (currentSound && soundPaths[currentSound]) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(soundPaths[currentSound]);
      audioRef.current.play();
      audioRef.current.onended = () => setCurrentSound(null); // reset
    }
  }, [currentSound, setCurrentSound]);

  return null;
};

export default Sound;
