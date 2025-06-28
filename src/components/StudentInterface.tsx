import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setStudentName, setShowResults, leavePoll } from '../store/pollSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import StudentJoin from './StudentJoin';
import StudentWelcome from './StudentWelcome';
import PollQuestion from './PollQuestion';
import PollResults from './PollResults';
import ChatPanel from './ChatPanel';
import KickedOut from './KickedOut';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';

const StudentInterface: React.FC = () => {
  const dispatch = useDispatch();
  const { currentPoll, studentName, timeRemaining, showResults, students, pendingStudents, pollHistory } = useSelector((state: RootState) => state.poll);
  const { emit, on } = useWebSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const savedName = sessionStorage.getItem('studentName');
    if (savedName) {
      dispatch(setStudentName(savedName));
      setHasJoined(true);
      // Check if student is already approved
      const student = students.find(s => s.name === savedName);
      if (student) {
        setIsApproved(true);
        setIsWaitingApproval(false);
        // Show welcome if no current poll
        if (!currentPoll) {
          setShowWelcome(true);
        }
      } else {
        // Check if waiting for approval
        const pending = pendingStudents.find(s => s.name === savedName);
        if (pending) {
          setIsWaitingApproval(true);
          setIsApproved(false);
        } else {
          // Request to join again
          emit('requestJoin', { name: savedName });
          setIsWaitingApproval(true);
        }
      }
    }
  }, [dispatch, emit, students, pendingStudents, currentPoll]);

  on('newPoll', () => {
    setHasAnswered(false);
    setShowWelcome(false);
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
    // Show welcome screen again after poll is removed
    if (isApproved) {
      setShowWelcome(true);
    }
  });

  on('studentRemoved', (data: { name: string }) => {
    if (data.name === studentName) {
      // Show toast notification instead of redirecting
      toast.error("You have been removed from the poll by the teacher");
      // Stay on the same page but show as kicked out state
    }
  });

  on('studentApproved', (data: { name: string }) => {
    if (data.name === studentName) {
      setIsWaitingApproval(false);
      setIsApproved(true);
      setShowWelcome(true);
    }
  });

  on('studentRejected', (data: { name: string }) => {
    if (data.name === studentName) {
      setIsWaitingApproval(false);
      setIsApproved(false);
      setHasJoined(false);
      sessionStorage.removeItem('studentName');
    }
  });

  const handleJoin = (name: string) => {
    dispatch(setStudentName(name));
    sessionStorage.setItem('studentName', name);
    setHasJoined(true);
    setIsWaitingApproval(true);
    emit('requestJoin', { name });
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
    setIsWaitingApproval(false);
    setIsApproved(false);
    setShowWelcome(false);
  };

  const handleWelcomeContinue = () => {
    setShowWelcome(false);
  };

  // Check if student is kicked but don't redirect
  const isKicked = isApproved && !students.find(s => s.name === studentName);

  if (isKicked) {
    return <KickedOut onReturnHome={handleReturnHome} />;
  }

  if (!hasJoined) {
    return <StudentJoin onJoin={handleJoin} />;
  }

  if (isWaitingApproval) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full mb-8">
            <span className="mr-2">⭐</span>
            <span className="font-medium">Intervue Poll</span>
          </div>
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Waiting for teacher approval...</h1>
          <p className="text-gray-600">Your teacher needs to approve your request to join the poll.</p>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return <StudentWelcome studentName={studentName} onContinue={handleWelcomeContinue} showContinueButton={!!currentPoll} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {isKicked && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md m-4">
              <p className="font-medium">You have been removed from the poll by the teacher.</p>
              <button 
                onClick={handleReturnHome}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Return to Home
              </button>
            </div>
          )}
          
          {!currentPoll && !isKicked ? (
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
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Current Poll */}
                {currentPoll && !isKicked && (
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Current Question
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

                    <div className="p-6">
                      {currentPoll.isActive && !hasAnswered && !showResults ? (
                        <PollQuestion poll={currentPoll} onSubmit={handleAnswerSubmit} />
                      ) : (
                        <PollResults />
                      )}
                    </div>
                  </div>
                )}

                {/* Poll History */}
                {pollHistory.length > 0 && (
                  <div className="space-y-6">
                    {pollHistory.map((poll, index) => (
                      <div key={poll.id} className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Question {index + 1}
                          </h3>
                        </div>
                        <div className="p-6">
                          <div className="bg-gray-800 text-white p-4 rounded-lg mb-6">
                            <h4 className="text-lg font-medium">{poll.question}</h4>
                          </div>
                          <div className="space-y-4">
                            {poll.options.map((option, optIndex) => {
                              const votes = poll.votes[option] || 0;
                              const totalVotes = Object.values(poll.votes).reduce((sum, v) => sum + v, 0);
                              const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                              
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
                                      {votes} vote{votes !== 1 ? 's' : ''}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
