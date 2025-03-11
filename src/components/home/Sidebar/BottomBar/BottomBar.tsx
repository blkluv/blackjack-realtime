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

  const onEmojiClick = (event: React.KeyboardEvent<HTMLInputElement>, emojiObject: any) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowPicker(false); // Optionally close the picker after emoji selection
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
      <div className="relative flex-1"> {/* Container for Input and Emoji Picker Toggle */}
        <Input
          placeholder="Type your message"
          className="border-zinc-800 bg-zinc-900 rounded-lg focus-visible:ring-zinc-700 pr-10" // pr-10 to give space for emoji button
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <CustomButton
          onClick={togglePicker}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer rounded-lg text-zinc-100 hover:bg-zinc-800 active:bg-zinc-700"
          aria-label="Toggle emoji picker"
        >
          <Smile className="size-5" />
        </CustomButton>
        {showPicker && (
          <div className="absolute bottom-14 right-0 z-10"> {/* Adjust bottom value as needed */}
            <Picker />
          </div>
        )}
      </div>
      <CustomButton
        className="cursor-pointer rounded-lg bg-zinc-100 text-zinc-900"
        aria-label="Send message" // Accessibility label
      >
        <Send size={18} />
      </CustomButton>
    </form>
  );
};

export default BottomBar;
