
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import CreatePoll from './CreatePoll';
import PollResults from './PollResults';
import ParticipantsPanel from './ParticipantsPanel';
import ChatPanel from './ChatPanel';
import StudentApproval from './StudentApproval';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { currentPoll, timeRemaining, pendingStudents } = useSelector((state: RootState) => state.poll);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('participants');
  const { emit } = useWebSocket();

  const handleCreateNewQuestion = () => {
    setShowCreatePoll(true);
  };

  const handleRemovePoll = () => {
    if (window.confirm('Are you sure you want to remove this poll?')) {
      emit('removePoll', {});
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!currentPoll ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {/* Student Approval Section */}
              {pendingStudents.length > 0 && (
                <div className="w-full max-w-2xl mb-8">
                  <StudentApproval />
                </div>
              )}
              
              <div className="text-center">
                <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full mb-8">
                  <span className="mr-2">⭐</span>
                  <span className="font-medium">Intervue Poll</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Let's Get Started</h1>
                <p className="text-lg text-gray-600 mb-8">
                  You'll have the ability to create and manage polls, ask questions, and monitor
                  <br />
                  your students' responses in real-time.
                </p>
                
                {showCreatePoll ? (
                  <CreatePoll onClose={() => setShowCreatePoll(false)} />
                ) : (
                  <Button
                    onClick={handleCreateNewQuestion}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-full"
                  >
                    Ask Question
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6">
              <div className="bg-white rounded-lg shadow-sm p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-900">Question</h2>
                    {currentPoll.isActive && (
                      <div className="flex items-center text-red-600 font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:
                        {(timeRemaining % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCreateNewQuestion}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
                    >
                      + Ask a new question
                    </Button>
                  </div>
                </div>
                
                <PollResults />
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-4 py-3 text-center font-medium ${
                activeTab === 'chat' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 px-4 py-3 text-center font-medium relative ${
                activeTab === 'participants' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Participants
              {pendingStudents.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingStudents.length}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex-1">
            {activeTab === 'chat' ? <ChatPanel /> : <ParticipantsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
