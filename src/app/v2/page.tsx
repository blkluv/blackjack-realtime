import PlayerDeck from '@/components/home/PlayerDeck';
// import { EPlayingCardState } from "@/components/home/PlayingCard";
// import PlayingCard from "@/components/home/PlayingCard";
import Sidebar from '@/components/home/Sidebar/Sidebar';

const Home = () => {
  return (
    <div className="flex h-screen bg-zinc-950">
      <div className="w-full h-full flex-col">
        <div className="flex h-1/2">
          <PlayerDeck />
          <PlayerDeck />
        </div>
        <div className="grid h-1/2 grid-cols-2 xl:grid-cols-4">
          <PlayerDeck />
          <PlayerDeck />
          <PlayerDeck />
          <PlayerDeck />
        </div>
      </div>
      <Sidebar />
    </div>
  );
};

export default Home;
