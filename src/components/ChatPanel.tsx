
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { wsService } from '../services/websocket';

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isTeacher?: boolean;
}

const ChatPanel: React.FC = () => {
  const { role, studentName } = useSelector((state: RootState) => state.poll);
  const { emit, on } = useWebSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing messages
    const existingMessages = wsService.getChatMessages();
    setMessages(existingMessages);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  on('newMessage', (message: ChatMessage) => {
    setMessages(prev => {
      const exists = prev.find(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userName = role === 'teacher' ? 'Teacher' : studentName;
    
    emit('sendMessage', {
      user: userName,
      message: newMessage.trim(),
      isTeacher: role === 'teacher'
    });

    setNewMessage('');
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Start a conversation!</p>
              <p className="text-sm mt-1">Send a message to begin chatting</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    message.isTeacher ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    {message.user}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <div className={`p-3 rounded-lg max-w-xs break-words ${
                  message.isTeacher 
                    ? 'bg-purple-100 text-purple-900 ml-auto' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            maxLength={500}
          />
          <Button 
            type="submit" 
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {newMessage.length > 0 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {newMessage.length}/500
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
