
import React, { useState, useEffect } from 'react';
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
  const { currentPoll, timeRemaining, pendingStudents, pollHistory, students } = useSelector((state: RootState) => state.poll);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('participants');
  const { emit, on } = useWebSocket();

  useEffect(() => {
    console.log('TeacherDashboard - Pending students changed:', pendingStudents);
  }, [pendingStudents]);

  on('studentJoinRequest', (data: { name: string }) => {
    console.log('TeacherDashboard - Student join request received:', data.name);
    setActiveTab('participants');
  });

  const handleCreateNewQuestion = () => {
    setShowCreatePoll(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!currentPoll && pollHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {/* Student Approval Section */}
              {pendingStudents.length > 0 && (
                <div className="w-full max-w-4xl mb-8">
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
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Current Poll */}
                {currentPoll && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-900">Current Question</h2>
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
                )}

                {/* Show Create Poll Button if no current poll */}
                {!currentPoll && pollHistory.length > 0 && (
                  <div className="text-center py-8">
                    {showCreatePoll ? (
                      <CreatePoll onClose={() => setShowCreatePoll(false)} />
                    ) : (
                      <Button
                        onClick={handleCreateNewQuestion}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-full"
                      >
                        + Ask a new question
                      </Button>
                    )}
                  </div>
                )}

                {/* Poll History - Only unique polls */}
                {pollHistory.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Previous Questions</h2>
                    {pollHistory.map((poll, index) => (
                      <div key={poll.id} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Question {index + 1}
                          </h3>
                        </div>
                        
                        <div className="bg-gray-800 text-white p-4 rounded-lg mb-6">
                          <h4 className="text-lg font-medium">{poll.question}</h4>
                        </div>

                        <div className="space-y-4">
                          {poll.options.map((option, optIndex) => {
                            const votes = poll.votes[option] || 0;
                            const totalStudents = students.length;
                            const percentage = totalStudents > 0 ? Math.round((votes / totalStudents) * 100) : 0;
                            
                            return (
                              <div key={option} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="flex items-center justify-between p-4">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                                      {optIndex + 1}
                                    </div>
                                    <span className="text-gray-900 font-medium text-lg flex-1">{option}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-gray-900 font-bold text-lg">{percentage}%</div>
                                  </div>
                                </div>
                                <div className="px-4 pb-4">
                                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div 
                                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <div className="text-sm text-gray-500 mt-2">
                                    {votes} out of {totalStudents} students ({percentage}%)
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
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
