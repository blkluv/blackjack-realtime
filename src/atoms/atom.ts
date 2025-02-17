import { atom } from 'jotai';
import type PartySocket from 'partysocket';

// type Message = string | ArrayBuffer | Blob | ArrayBufferView;

// type WsSend = (data: Message) => void;

// const wsSendAtom = atom<{ wssend: WsSend | null }>({
//   wssend: null,
// });

// const setWsSendAtom = atom(null, (_get, set, newSend: WsSend) => {
//   set(wsSendAtom, { wssend: newSend });
// });

// export { type WsSend, wsSendAtom, setWsSendAtom };

const partyKitAtom = atom<PartySocket | null>(null);

const setPartyKitAtom = atom(null, (_get, set, newParty: PartySocket) => {
  set(partyKitAtom, newParty);
});

export { partyKitAtom, setPartyKitAtom };
