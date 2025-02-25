'use client';

import Sidebar from '@/components/home/Sidebar/Sidebar';
import Table from '@/components/home/Table';
import { usePartyKit } from '@/hooks/usePartyKit';

const Home = () => {
  const { readyState } = usePartyKit();

  return (
    <div className="flex h-screen bg-zinc-950">
      <div className="w-full h-full p-8">
        <Table />
      </div>
      <Sidebar />
    </div>
  );
};

export default Home;
