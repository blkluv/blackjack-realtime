import { userAtom } from '@/atoms/user.atom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBlackjack } from '@/hooks/useBlackjack';
import { cn } from '@/lib/utils';
import { useDevices, useLocalAudio } from '@huddle01/react';
import { useAtom, useAtomValue } from 'jotai';
import {
  Check,
  MicIcon,
  MicOffIcon,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toast } from 'sonner';

import { huddleSpeakerAtom } from '@/atoms/huddle.atom';
import { Button } from '@/components/ui/button';

const BottomBarControls = () => {
  return (
    <div className="flex bg-zinc-100 rounded-lg divide-x divide-zinc-400 ">
      <MicButton />
      <SettingsButton />
    </div>
  );
};

export default BottomBarControls;

const MicButton = () => {
  const user = useAtomValue(userAtom);
  const { gameState } = useBlackjack();
  const { enableAudio, disableAudio, isAudioOn, isProducing } = useLocalAudio();

  const handleMicClick = () => {
    const getCurrentPlayer = () => {
      if (!user.walletAddress) return;
      for (const player of Object.values(gameState.players)) {
        if (player.userId === user.walletAddress) {
          return player;
        }
      }
    };

    const player = getCurrentPlayer();

    if (!player) {
      toast.error('Only players can use the mic');
      return;
    }

    if (isAudioOn && isProducing) {
      disableAudio();
      console.log('Audio disabled');
    } else {
      enableAudio();
      console.log('Audio enabled');
    }
  };

  return (
    <div>
      <Button
        className={cn(
          'flex items-center justify-center rounded-l-lg text-zinc-900 aspect-square cursor-pointer size-9 border-none outline-none hover:bg-zinc-300',
        )}
        onClick={handleMicClick}
      >
        {isAudioOn ? <MicIcon size={18} /> : <MicOffIcon size={18} />}
      </Button>
    </div>
  );
};

const SettingsButton = () => {
  const user = useAtomValue(userAtom);
  const { gameState } = useBlackjack();

  const { enableAudio, disableAudio, isAudioOn, isProducing } = useLocalAudio();

  const handleMicClick = () => {
    const getCurrentPlayer = () => {
      if (!user.walletAddress) return;
      for (const player of Object.values(gameState.players)) {
        if (player.userId === user.walletAddress) {
          return player;
        }
      }
    };

    const player = getCurrentPlayer();

    if (!player) {
      toast.error('Only players can use the mic');
      return;
    }

    if (isAudioOn && isProducing) {
      disableAudio();
      console.log('Audio disabled');
    } else {
      enableAudio();
      console.log('Audio enabled');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            'flex items-center justify-center hover:rounded-r-lg text-zinc-900 hover:bg-zinc-300 aspect-square cursor-pointer rounded-r-lg outline-none rounded-none size-9 border-none',
          )}
          // onClick={handleMicClick}
        >
          <Settings size={18} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-950/10 backdrop-blur-2xl border border-zinc-800">
        <DropdownMenuLabel>Sound options</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <SpeakerChanger />
        <DropdownMenuSeparator className="bg-zinc-800" />
        <MicChanger />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MicChanger = () => {
  const { devices, setPreferredDevice, preferredDeviceId } = useDevices({
    type: 'mic',
  });
  return (
    <DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Change Mic</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="border w-56 border-zinc-800 bg-zinc-950/10 backdrop-blur-2xl">
            {devices.map((device, index) => {
              return (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setPreferredDevice(device.deviceId);
                    }}
                    className="flex items-center justify-between space-x-2"
                  >
                    <div className="truncate">{device.label}</div>
                    {(preferredDeviceId
                      ? preferredDeviceId === device.deviceId
                      : device.deviceId === 'default') && (
                      <Check className="text-green-500" />
                    )}
                  </DropdownMenuItem>
                  {index !== devices.length - 1 && (
                    <DropdownMenuSeparator className="bg-zinc-800" />
                  )}
                </>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  );
};

const SpeakerChanger = () => {
  const [huddleSpeaker, setHuddleSpeaker] = useAtom(huddleSpeakerAtom);
  const { devices, setPreferredDevice, preferredDeviceId } = useDevices({
    type: 'speaker',
  });

  const handleSpeakerClick = () => {
    setHuddleSpeaker((prev) => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  };

  return (
    <DropdownMenuGroup>
      <DropdownMenuItem
        onClick={handleSpeakerClick}
        className="flex justify-between items-center cursor-pointer"
      >
        <div>Turn {huddleSpeaker.isSpeakerOn ? 'off' : 'on'} Speaker</div>
        <div>
          {huddleSpeaker.isSpeakerOn ? (
            <Volume2 size={18} />
          ) : (
            <VolumeX size={18} />
          )}
        </div>
      </DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Change Speaker</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="border w-56 border-zinc-800 bg-zinc-950/10 backdrop-blur-2xl">
            {devices.map((device, index) => {
              return (
                <div key={device.deviceId}>
                  <DropdownMenuItem
                    onClick={() => {
                      setPreferredDevice(device.deviceId);
                    }}
                    className="flex items-center justify-between space-x-2"
                  >
                    <div className="truncate">{device.label}</div>
                    {(preferredDeviceId
                      ? preferredDeviceId === device.deviceId
                      : device.deviceId === 'default') && (
                      <Check className="text-green-500" />
                    )}
                  </DropdownMenuItem>
                  {index !== devices.length - 1 && (
                    <DropdownMenuSeparator className="bg-zinc-800" />
                  )}
                </div>
              );
            })}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  );
};
