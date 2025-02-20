import { Hand, HandCoins, HandHelping } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

const ControlCentre = () => {
  return (
    <div className="flex flex-col space-y-4 py-4 border-b border-zinc-900">
      <div className="flex flex-col space-y-2 px-4">
        <div className="text-zinc-400 text-sm">Bet Amount</div>
        <div className="flex space-x-4">
          <Input
            placeholder="Place your bet"
            className="border-zinc-800 bg-zinc-900 rounded-full focus-visible:ring-zinc-700"
          />
          <Button className="cursor-pointer rounded-full text-zinc-100 bg-zinc-900 border border-zinc-800">
            All
          </Button>
        </div>
      </div>
      <div className="flex space-x-4 px-4">
        <Button className="cursor-pointer space-x-0 w-full rounded-full text-zinc-100 bg-zinc-900 border border-zinc-800">
          <div className="font-semibold">Hit</div>
          <HandHelping />
        </Button>
        <Button className="cursor-pointer w-full rounded-full text-zinc-100 bg-zinc-900 border border-zinc-800">
          <div className="font-semibold">Stand</div>
          <Hand />
        </Button>
      </div>
      <div className="px-4">
        <Button className="cursor-pointer space-x-0 w-full rounded-full bg-zinc-100 text-zinc-900">
          <div className="font-semibold">Bet</div>
          <HandCoins />
        </Button>
      </div>
    </div>
  );
};

export default ControlCentre;
