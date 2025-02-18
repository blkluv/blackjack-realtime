'use client';
import { ActionButtons } from '@/components/home/ActionButtons';
import { Background } from '@/components/home/Background';
import { CursorSpace } from '@/components/home/CursorSpace';
import { DealerView } from '@/components/home/DealerView';
import { Navbar } from '@/components/home/Navbar';
import { PlayerLayout } from '@/components/home/PlayerLayout';
import { usePartyKit } from '@/hooks/usePartyKit';

const GamePage = () => {
  const { readyState } = usePartyKit();

  return (
    <div className="h-screen relative w-full overflow-hidden flex flex-col items-center">
      <Navbar />
      <DealerView />
      <Background />
      <PlayerLayout />
      <ActionButtons />
      <CursorSpace />
    </div>
  );
};

export default GamePage;
