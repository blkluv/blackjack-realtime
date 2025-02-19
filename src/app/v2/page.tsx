import DeckOfCards2 from '@/components/home/DeckOfCards2';
// import PlayingCard from "@/components/home/PlayingCard";
import Sidebar from '@/components/home/Sidebar/Sidebar';

const Home = () => {
  return (
    <div className="flex h-screen bg-slate-950">
      <div className="w-full h-full flex-col">
        <div className="flex h-1/2">
          <div className="w-full flex justify-center items-center">
            <DeckOfCards2 cards={['Tc', 'Kd', 'Tc']} flipped />
          </div>
          <div className="w-full flex justify-center items-center">a</div>
        </div>
        <div className="flex h-1/2">
          <div className="w-full flex justify-center items-center">a</div>
          <div className="w-full flex justify-center items-center">a</div>
          <div className="w-full flex justify-center items-center">a</div>
          <div className="w-full flex justify-center items-center">a</div>
        </div>
      </div>
      <Sidebar />
    </div>
  );
};

export default Home;
