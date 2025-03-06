'use client';

import { huddleSpeakerAtom } from '@/atoms/huddle.atom';
import { rulesAtom } from '@/atoms/rules.atom';
import { timeStateAtom } from '@/atoms/time.atom';
import Rules from '@/components/home/Rules';
import HuddleSpeaker from '@/components/home/Sidebar/BottomBar/HuddleSpeaker';
import Logo from '@/components/home/Sidebar/Logo';
import Navbar from '@/components/home/Sidebar/Navbar';
// import Logo from "@/components/home/Sidebar/Logo";
import Sidebar from '@/components/home/Sidebar/Sidebar';
import Table from '@/components/home/Table/Table';
import { ESoundType, playSound } from '@/components/home/Utils/sound';
import { env } from '@/env.mjs';
import { useBlackjack } from '@/hooks/useBlackjack';
import useMounted from '@/hooks/useMounted';
import { usePartyKit } from '@/hooks/usePartyKit';
import { useUser } from '@/hooks/useUser';
import { cn, truncateAddress } from '@/lib/utils';
import { useRoom } from '@huddle01/react';
import { useAtom, useAtomValue } from 'jotai';
import { MousePointerClick, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BETTING_PERIOD } from '../../party/blackjack/blackjack.types';

const Home = () => {
  const isMounted = useMounted();
  const { readyState } = usePartyKit();
  const [huddleSpeaker] = useAtom(huddleSpeakerAtom);
  const { joinRoom, state } = useRoom({
    onJoin: () => {
      console.log('Joined room');
    },
  });

  const { user } = useUser();
  const roomId = env.NEXT_PUBLIC_HUDDLE01_ROOM_ID;
  useEffect(() => {
    const fetchToken = async () => {
      if (state === 'connecting' || state === 'connected') return;

      const res = await fetch(`/api/token?roomId=${roomId}`, {
        method: 'GET',
      });
      const { token } = (await res.json()) as { token: string };

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
          <div className="absolute top-4 left-4">
            <Rules />
          </div>
          <HowToBox />
          <Table />
          <Tekken />
        </div>
        <div className="flex flex-col">{/* <MobileControlCentre /> */}</div>
      </div>
      <Sidebar />
      {huddleSpeaker.isSpeakerOn && <HuddleSpeaker />}
    </div>
  );
};

export default Home;

const HowToBox = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useAtom(rulesAtom);
  const { mySeat } = useBlackjack();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isClosed = localStorage.getItem('howToBoxClosed') === 'true';
      console.log('isClosed:', isClosed);
      setIsVisible(!isClosed);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('howToBoxClosed', 'true');
  };

  const shouldVisible = isVisible && mySeat === -1;

  if (!shouldVisible) return null;

  return (
    <div
      className={cn(
        'absolute flex flex-col p-3 z-10 top-4 right-4 w-64 bg-zinc-950/40 backdrop-blur-xl rounded-xl border border-zinc-800',
      )}
    >
      <div className="flex justify-end">
        <X size={16} className="cursor-pointer" onClick={handleClose} />
      </div>
      <div className="flex flex-col items-center">
        <MousePointerClick size={64} className="text-yellow-400" />
        <div className="p-4 text-sm text-center">
          Click on the Character to reserve a position.
        </div>
        <div className="text-sm text-center">
          Also checkout the{' '}
          <span
            onClick={() => !isOpen && setIsOpen(true)}
            onKeyDown={() => !isOpen && setIsOpen(true)}
            className="underline cursor-pointer text-yellow-400"
          >
            rules
          </span>
          .
        </div>
      </div>
    </div>
  );
};

const Tekken = () => {
  const { startedAt: startTime, state, userId } = useAtomValue(timeStateAtom);
  const bettingDuration = BETTING_PERIOD;
  const isBet = state === 'betTimerStart';
  const [countdown, setCountdown] = useState(Math.ceil(bettingDuration / 1000));

  useEffect(() => {
    if (!isBet) return;

    const updateCountdown = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(
        0,
        Math.ceil((bettingDuration - elapsed) / 1000),
      );
      setCountdown(remaining);
      playSound(ESoundType.DING, { volume: 0.1 });
    };

    updateCountdown();

    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [startTime, isBet]);

  if (!isBet) return null;

  return (
    <div className="absolute z-20 flex-col space-y-4 top-0 left-0 w-full h-full backdrop-blur-xs bg-gradient-to-b from-transparent to-transparent via-zinc-950/80 flex items-center justify-center">
      <div className="text-5xl text-yellow-400 font-serif">
        Place your bets in
      </div>
      <div className="text-10xl text-yellow-400 font-serif text-8xl">
        {countdown}
      </div>
      <div className="text-10xl text-yellow-400 font-serif text pt-4">
        Round started by {truncateAddress(userId)}
      </div>
    </div>
  );
};
