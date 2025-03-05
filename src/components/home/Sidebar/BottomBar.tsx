'use client';

import { userAtom } from '@/atoms/user.atom';
import CustomButton from '@/components/ui/CustomButton';
import { useBlackjack } from '@/hooks/useBlackjack';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { useLocalAudio } from '@huddle01/react';
import { useAtomValue } from 'jotai';
import { MicIcon, MicOffIcon, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../../ui/input';

const BottomBar = () => {
  const user = useAtomValue(userAtom);
  const { gameState } = useBlackjack();
  // const [isMicOn, setIsMicOn] = useState(false);
  const [message, setMessage] = useState('');
  const { chatSend } = useChat();
  const { stream, enableAudio, disableAudio, isAudioOn, isProducing } =
    useLocalAudio();

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      // Prevent sending empty messages
      chatSend({ data: { message }, type: 'user-message' }); // Send the message using chatSend hook
      setMessage(''); // Clear the input field after sending
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Check for Enter key press without Shift
      e.preventDefault(); // Prevent default form submission behavior
      handleSendMessage();
    }
  };

  const handleMicClick = async () => {
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
    console.log(isAudioOn, isProducing);
    if (isAudioOn) {
      await disableAudio();
      console.log('Audio disabled');
    } else {
      await enableAudio();
      console.log('Audio enabled');
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Prevent default form submission on button click
        handleSendMessage();
      }}
      className="flex p-4 space-x-4 border-t border-zinc-900"
    >
      <CustomButton
        className={cn(
          'flex items-center justify-center aspect-square cursor-pointer size-9 border border-zinc-800 p-2 bg-zinc-900 rounded-full',
          isAudioOn && 'bg-zinc-100 text-zinc-900',
        )}
        onClick={handleMicClick}
      >
        {isAudioOn ? <MicIcon size={18} /> : <MicOffIcon size={18} />}
      </CustomButton>
      <Input
        placeholder="Type your message"
        className="border-zinc-800 bg-zinc-900 rounded-lg focus-visible:ring-zinc-700"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <CustomButton
        className="cursor-pointer rounded-lg bg-zinc-100 text-zinc-900"
        aria-label="Send message" // Accessibility label
      >
        <div className="font-semibold">Send</div>
        <Send className="ml-2" size={18} />{' '}
        {/* Add ml-2 for spacing and size for icon */}
      </CustomButton>
    </form>
  );
};

export default BottomBar;
