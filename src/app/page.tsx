'use client';

import Sidebar from '@/components/home/Sidebar/Sidebar';
import Table from '@/components/home/Table';
import { usePartyKit } from '@/hooks/usePartyKit';
import Image from 'next/image';

const Home = () => {
  const { readyState } = usePartyKit();

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
      <div className="relative w-full h-full p-8 z-10">
        <Table />
      </div>
      <Sidebar />
    </div>
  );
};

export default Home;
