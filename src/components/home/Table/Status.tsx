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

  return (
    <div className="flex space-x-3 mb-4">
      <Headset size={18} className={cn(getHuddleColor())} />
      <Network size={18} className={cn(getPartyColor())} />
    </div>
  );
};

export default Status;
