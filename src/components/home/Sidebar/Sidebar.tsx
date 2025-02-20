import BottomBar from './BottomBar';
import ControlCentre from './ControlCentre';
import GameLog from './GameLog';
import Navbar from './Navbar';

const Sidebar = () => {
  return (
    <div className="w-96 shrink-0 h-full border-l border-zinc-900 flex flex-col justify-between">
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
