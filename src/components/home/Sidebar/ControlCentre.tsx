import { Hand, HandCoins, HandHelping } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

const ControlCentre = () => {
  return (
    <div className="flex flex-col space-y-4 py-4 border-b border-slate-900">
      <div className="flex flex-col space-y-2 px-4">
        <div className="text-slate-400 text-sm">Bet Amount</div>
        <div className="flex space-x-4">
          <Input
            placeholder="Place your bet"
            className="border-slate-800 bg-slate-900 rounded-full focus-visible:ring-slate-700"
          />
          <Button className="cursor-pointer rounded-full text-slate-100 bg-slate-900 border border-slate-800">
            All
          </Button>
        </div>
      </div>
      <div className="flex space-x-4 px-4">
        <Button className="cursor-pointer space-x-0 w-full rounded-full text-slate-100 bg-slate-900 border border-slate-800">
          <div className="font-semibold">Hit</div>
          <HandHelping />
        </Button>
        <Button className="cursor-pointer w-full rounded-full text-slate-100 bg-slate-900 border border-slate-800">
          <div className="font-semibold">Stand</div>
          <Hand />
        </Button>
      </div>
      <div className="px-4">
        <Button className="cursor-pointer space-x-0 w-full rounded-full bg-slate-100 text-slate-900">
          <div className="font-semibold">Bet</div>
          <HandCoins />
        </Button>
      </div>
    </div>
  );
};

export default ControlCentre;
