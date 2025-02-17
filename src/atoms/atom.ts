import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type PartySocket from 'partysocket';

function generateRandomString(length: number) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let randomString = '';
  const stringLength = length || 10; // Default length if not provided

  for (let i = 0; i < stringLength; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * charactersLength),
    );
  }

  return randomString;
}

const staticIdAtom = atomWithStorage('staticId', generateRandomString(10));

const partyKitAtom = atom<PartySocket | null>(null);

const setPartyKitAtom = atom(null, (_get, set, newParty: PartySocket) => {
  set(partyKitAtom, newParty);
});

export { partyKitAtom, setPartyKitAtom, generateRandomString, staticIdAtom };
