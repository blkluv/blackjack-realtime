import type { ESoundType } from '@/components/home/Utils/sound';
import { atom } from 'jotai';

export const soundAtom = atom<ESoundType | null>(null);
