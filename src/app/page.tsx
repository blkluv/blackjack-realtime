'use client';

import Logo from '@/components/home/Sidebar/Logo';
import Navbar from '@/components/home/Sidebar/Navbar';
// import Logo from "@/components/home/Sidebar/Logo";
import Sidebar from '@/components/home/Sidebar/Sidebar';
import Table from '@/components/home/Table/Table';
import { env } from '@/env.mjs';
import useMounted from '@/hooks/useMounted';
import { usePartyKit } from '@/hooks/usePartyKit';
import {
  // useLocalPeer,
  usePeerIds,
  useRemoteAudio,
  useRoom,
} from '@huddle01/react';
// import { createRoom } from "@/lib/action";
import { Audio } from '@huddle01/react/components';
import Image from 'next/image';
import { memo, useEffect } from 'react';
// import MobileControlCentre from "@/components/home/MobileControlCentre";
// import PeerAudioElem from "@/components/home/asd";

const Home = () => {
  const isMounted = useMounted();
  const { readyState } = usePartyKit();
  const { joinRoom } = useRoom({
    onJoin: () => {
      console.log('Joined room');
    },
  });
  const roomId = env.NEXT_PUBLIC_HUDDLE01_ROOM_ID;
  useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch(`/api/token?roomId=${roomId}`, {
        method: 'GET',
      });
      const { token } = (await res.json()) as { token: string };
      console.log(token);

      joinRoom({
        roomId,
        token,
      });
    };
    fetchToken();
  }, []);

  if (!isMounted) {
    return (
      <div className="flex bg-zinc-950 items-center justify-center h-screen ">
        <Logo isLoading />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen bg-zinc-0 overflow-hidden">
      <Image
        src={'/bg.png'}
        alt=""
        layout="fill"
        objectFit="cover"
        quality={100}
        className="brightness-[35%]"
      />
      <div className="flex flex-col overflow-hidden w-full z-10">
        <Navbar forMobile />
        <div className="relative w-full h-full p-8">
          <Table />
        </div>
        <div className="flex flex-col">{/* <MobileControlCentre /> */}</div>
      </div>

      <Sidebar />
      <HuddleAudioWrapper />
    </div>
  );
};

export default Home;

const HuddleAudioWrapper = () => {
  const { peerIds } = usePeerIds({
    labels: ['audio'],
  });
  return (
    <>
      {peerIds.map((peerId) => (
        <RemotePeer peerId={peerId} />
      ))}
    </>
  );
};

const RemotePeer = memo(({ peerId }: { peerId: string }) => {
  const { state, stream } = useRemoteAudio({ peerId: peerId as string });

  if (stream && state === 'playable' && peerId)
    return <Audio key={`peer-audio-wrapper-${peerId}`} stream={stream} />;
  return null;
});
