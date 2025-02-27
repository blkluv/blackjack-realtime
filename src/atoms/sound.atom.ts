import type { SoundType } from '@/components/home/Utils/sound';
import { atom } from 'jotai';

export const soundAtom = atom<SoundType | null>(null);
