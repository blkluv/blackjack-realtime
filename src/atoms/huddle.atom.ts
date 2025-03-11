import { atomWithStorage } from 'jotai/utils';

export const huddleSpeakerAtom = atomWithStorage('huddleSpeaker', {
  isSpeakerOn: true,
});
