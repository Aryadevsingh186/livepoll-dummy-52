
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isTeacher?: boolean;
}

const ChatPanel: React.FC = () => {
  const { role, studentName } = useSelector((state: RootState) => state.poll);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'User1',
      message: 'Hey There , how can I help?',
      timestamp: new Date(),
    },
    {
      id: '2',
      user: 'User2',
      message: 'Nothing bro..just chill!!',
      timestamp: new Date(),
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: role === 'teacher' ? 'Teacher' : studentName,
      message: newMessage.trim(),
      timestamp: new Date(),
      isTeacher: role === 'teacher'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-600">{message.user}</span>
              </div>
              <div className={`p-3 rounded-lg max-w-xs ${
                message.isTeacher 
                  ? 'bg-purple-100 text-purple-900 ml-auto' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          />
          <Button 
            type="submit" 
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
