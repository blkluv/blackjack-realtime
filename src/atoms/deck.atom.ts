import { atom } from 'jotai';

export const deckPositionAtom = atom({
  x: 0,
  y: 0,
  viewportX: 0,
  viewportY: 0,
  width: 0,
  height: 0,
});
