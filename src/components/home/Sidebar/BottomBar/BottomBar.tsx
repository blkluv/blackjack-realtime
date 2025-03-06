'use client';

import CustomButton from '@/components/ui/CustomButton';
import { useChat } from '@/hooks/useChat';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../../../ui/input';
import BottomBarControls from './HyperMic';

const BottomBar = () => {
  const [message, setMessage] = useState('');
  const { chatSend } = useChat();

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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Prevent default form submission on button click
        handleSendMessage();
      }}
      className="flex p-4 space-x-4 border-t border-zinc-900 items-center"
    >
      <BottomBarControls />
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
