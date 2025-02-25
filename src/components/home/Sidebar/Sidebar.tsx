import BottomBar from './BottomBar';
import ControlCentre from './ControlCentre';
import GameLog from './GameLog';
import Navbar from './Navbar';

const Sidebar = () => {
  return (
    <div className="w-96 hidden z-10 lg:flex shrink-0 h-full border-l bg-zinc-950/30 backdrop-blur-sm border-zinc-900 flex-col justify-between">
      <div className="flex flex-col">
        <Navbar />
        <ControlCentre />
      </div>
      <GameLog />
      <BottomBar />
    </div>
  );
};

export default Sidebar;
