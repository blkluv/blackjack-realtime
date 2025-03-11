import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { RoomStates } from '@huddle01/web-core/types';
import { Headset, Network } from 'lucide-react';
import type { FC } from 'react';

enum EPartyKitStatus {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

type TStatusProps = {
  huddleStatus: RoomStates;
  partyStatus: EPartyKitStatus;
};

const Status: FC<TStatusProps> = ({ huddleStatus, partyStatus }) => {
  const getHuddleColor = () => {
    const colorMap = {
      connected: 'text-green-500',
      connecting: 'text-yellow-500',
      idle: 'text-yellow-500',
      closed: 'text-red-500',
      failed: 'text-red-500',
      left: 'text-red-500',
    };

    return colorMap[huddleStatus] || 'text-gray-500';
  };

  const getPartyColor = () => {
    const colorMap = {
      [EPartyKitStatus.CONNECTING]: 'text-yellow-500',
      [EPartyKitStatus.OPEN]: 'text-green-500',
      [EPartyKitStatus.CLOSING]: 'text-yellow-500',
      [EPartyKitStatus.CLOSED]: 'text-red-500',
    };

    return colorMap[partyStatus] || 'text-gray-500';
  };

  const getHuddleTooltip = () => {
    const tooltipMap: { [key in RoomStates]: string } = {
      connected: 'Voice chat connected',
      connecting: 'Connecting voice chat',
      idle: 'Idle',
      closed: 'Closed',
      failed: 'Failed',
      left: 'Left',
    };

    return tooltipMap[huddleStatus];
  };

  const getPartyTooltip = () => {
    const tooltipMap: { [key in EPartyKitStatus]: string } = {
      [EPartyKitStatus.CONNECTING]: 'Connecting to game server',
      [EPartyKitStatus.OPEN]: 'Game server connected',
      [EPartyKitStatus.CLOSING]: 'Closing party',
      [EPartyKitStatus.CLOSED]: 'Party closed',
    };

    return tooltipMap[partyStatus];
  };

  return (
    <div className="flex space-x-3 mb-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Headset size={18} className={cn(getHuddleColor())} />
          </TooltipTrigger>
          <TooltipContent>
            <p>{getHuddleTooltip()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Network size={18} className={cn(getPartyColor())} />
          </TooltipTrigger>
          <TooltipContent>
            <p>{getPartyTooltip()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Status;
