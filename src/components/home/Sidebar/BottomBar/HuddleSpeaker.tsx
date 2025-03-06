import { usePeerIds, useRemoteAudio } from '@huddle01/react';
import { Audio } from '@huddle01/react/components';
import { memo } from 'react';

const HuddleSpeaker = () => {
  const { peerIds } = usePeerIds({
    labels: ['audio'],
  });
  return (
    <>
      {peerIds.map((peerId) => (
        <RemotePeer key={`peer-${peerId}`} peerId={peerId} />
      ))}
    </>
  );
};

export default HuddleSpeaker;

const RemotePeer = memo(({ peerId }: { peerId: string }) => {
  const { state, stream } = useRemoteAudio({ peerId: peerId as string });

  if (stream && state === 'playable' && peerId)
    return <Audio key={`peer-audio-wrapper-${peerId}`} stream={stream} />;
  return null;
});
