'use client';

import Logo from '@/components/home/Sidebar/Logo';
// import Logo from "@/components/home/Sidebar/Logo";
import Sidebar from '@/components/home/Sidebar/Sidebar';
import Table from '@/components/home/Table/Table';
import useMounted from '@/hooks/useMounted';
import { usePartyKit } from '@/hooks/usePartyKit';
import Image from 'next/image';

const Home = () => {
  const isMounted = useMounted();
  const { readyState } = usePartyKit();
  // const { joinRoom } = useRoom({
  //   onJoin: () => {
  //     console.log('Joined room');
  //   },
  // });

  // useEffect(() => {
  //   joinRoom({
  //     roomId: 'your_room_id',
  //     token: 'your_token',
  //   });
  // }, [])

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
      <div className="relative w-full h-full p-8 z-10">
        {/* <div className="absolute top-4 left-4">

        </div> */}
        <Table />
      </div>
      <Sidebar />
    </div>
  );
};

export default Home;
