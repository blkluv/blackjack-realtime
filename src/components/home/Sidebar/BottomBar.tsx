'use client';

import { cn } from '@/lib/utils';
import { MicIcon, MicOffIcon, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';

const BottomBar = () => {
  const [isMicOn, setIsMicOn] = useState(false);

  return (
    <div className="flex p-4 space-x-4 border-t border-zinc-900">
      <Button
        className={cn(
          'flex items-center justify-center aspect-square cursor-pointer size-9 border border-zinc-800 p-2 bg-zinc-900 rounded-full',
          isMicOn && 'bg-zinc-100 text-zinc-900',
        )}
        onClick={() => setIsMicOn(!isMicOn)}
      >
        {isMicOn ? <MicIcon size={18} /> : <MicOffIcon size={18} />}
      </Button>
      <Input
        placeholder="Type your message"
        className="border-zinc-800 bg-zinc-900 rounded-full focus-visible:ring-zinc-700"
      />
      <Button className="cursor-pointer rounded-full bg-zinc-100 text-zinc-900">
        <div className="font-semibold">Send</div>
        <Send />
      </Button>
    </div>
  );
};

export default BottomBar;
