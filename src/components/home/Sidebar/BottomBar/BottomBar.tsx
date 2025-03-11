'use client';

import CustomButton from '@/components/ui/CustomButton';
import { useChat } from '@/hooks/useChat';
import Picker from 'emoji-picker-react';
import { Send } from 'lucide-react';
import { Smile } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../../../ui/input';
import BottomBarControls from './HyperMic';

const BottomBar = () => {
  const [message, setMessage] = useState('');
  const { chatSend } = useChat();
  const [showPicker, setShowPicker] = useState(false);

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

  const togglePicker = () => {
    setShowPicker((prevShowPicker) => !prevShowPicker);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Prevent default form submission on button click
        handleSendMessage();
      }}
      className="flex p-4 space-x-4 border-t border-zinc-900 items-center relative" // relative for picker positioning
    >
      <BottomBarControls />
      <div className="relative flex-1">
        <Input
          placeholder="Message here..."
          className="border-zinc-800 bg-zinc-900 rounded-lg focus-visible:ring-zinc-700"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {showPicker && (
          <div className="absolute bottom-14 -right-16 z-10">
            <Picker
              reactionsDefaultOpen
              onEmojiClick={(emoji) => {
                console.log(emoji.unified);
                setMessage((prevMessage) => prevMessage + emoji.emoji);
                setShowPicker(false);
              }}
              reactions={['1f4b0', '1f4b2', '1f4b3', '1f4b5', '1f4b8', '1f911']}
            />
          </div>
        )}
      </div>
      <div className="flex space-x-4">
        <CustomButton
          onClick={togglePicker}
          className=""
          type="button"
          aria-label="Toggle emoji picker"
        >
          <Smile className="size-5" />
        </CustomButton>
        <CustomButton
          className="cursor-pointer rounded-lg bg-zinc-100 text-zinc-900"
          aria-label="Send message" // Accessibility label
        >
          <Send size={18} />
        </CustomButton>
      </div>
    </form>
  );
};

export default BottomBar;
