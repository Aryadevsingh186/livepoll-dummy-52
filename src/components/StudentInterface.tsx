
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setStudentName, setShowResults, leavePoll } from '../store/pollSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import StudentJoin from './StudentJoin';
import PollQuestion from './PollQuestion';
import PollResults from './PollResults';
import ChatPanel from './ChatPanel';
import KickedOut from './KickedOut';
import { Clock } from 'lucide-react';

const StudentInterface: React.FC = () => {
  const dispatch = useDispatch();
  const { currentPoll, studentName, timeRemaining, showResults } = useSelector((state: RootState) => state.poll);
  const { emit, on } = useWebSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isKickedOut, setIsKickedOut] = useState(false);
  const [activeTab, setActiveTab] = useState<'question' | 'chat'>('question');

  useEffect(() => {
    const savedName = sessionStorage.getItem('studentName');
    if (savedName) {
      dispatch(setStudentName(savedName));
      setHasJoined(true);
      emit('joinAsStudent', { name: savedName });
    }
  }, [dispatch, emit]);

  on('newPoll', () => {
    setHasAnswered(false);
    dispatch(setShowResults(false));
  });

  on('pollEnded', () => {
    dispatch(setShowResults(true));
  });

  on('showResults', () => {
    dispatch(setShowResults(true));
  });

  on('pollRemoved', () => {
    setHasAnswered(false);
    dispatch(setShowResults(false));
  });

  on('studentRemoved', (data: { name: string }) => {
    if (data.name === studentName) {
      setIsKickedOut(true);
    }
  });

  const handleJoin = (name: string) => {
    dispatch(setStudentName(name));
    sessionStorage.setItem('studentName', name);
    setHasJoined(true);
    setIsKickedOut(false);
    emit('joinAsStudent', { name });
  };

  const handleAnswerSubmit = (option: string) => {
    emit('submitVote', { studentName, option });
    setHasAnswered(true);
  };

  const handleReturnHome = () => {
    sessionStorage.removeItem('studentName');
    dispatch(leavePoll());
    setHasJoined(false);
    setHasAnswered(false);
    setIsKickedOut(false);
  };

  if (isKickedOut) {
    return <KickedOut onReturnHome={handleReturnHome} />;
  }

  if (!hasJoined) {
    return <StudentJoin onJoin={handleJoin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!currentPoll ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full mb-8">
                  <span className="mr-2">⭐</span>
                  <span className="font-medium">Intervue Poll</span>
                </div>
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Wait for the teacher to ask questions..</h1>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6">
              <div className="bg-white rounded-lg shadow-sm h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Question {currentPoll ? '1' : ''}
                    </h2>
                    {currentPoll?.isActive && timeRemaining > 0 && (
                      <div className="flex items-center text-red-600 font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:
                        {(timeRemaining % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 h-full">
                  {currentPoll.isActive && !hasAnswered && !showResults ? (
                    <PollQuestion poll={currentPoll} onSubmit={handleAnswerSubmit} />
                  ) : (
                    <PollResults />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Chat */}
        <div className="w-80 bg-white border-l border-gray-200">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

export default StudentInterface;
