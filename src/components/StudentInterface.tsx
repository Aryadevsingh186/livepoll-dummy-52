
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

const StudentInterface: React.FC = () => {
  const dispatch = useDispatch();
  const { currentPoll, studentName, timeRemaining, showResults, students, pendingStudents, kickedStudents } = useSelector((state: RootState) => state.poll);
  const { emit, on } = useWebSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isKicked, setIsKicked] = useState(false);

  // Check student status on load
  useEffect(() => {
    const savedName = sessionStorage.getItem('studentName');
    if (savedName) {
      if (kickedStudents.includes(savedName)) {
        setIsKicked(true);
        return;
      }

      dispatch(setStudentName(savedName));
      setHasJoined(true);
      
      const student = students.find(s => s.name === savedName);
      if (student) {
        setIsApproved(true);
        setIsWaitingApproval(false);
        setIsKicked(false);
        if (!currentPoll) {
          setShowWelcome(true);
        }
      } else {
        const pending = pendingStudents.find(s => s.name === savedName);
        if (pending) {
          setIsWaitingApproval(true);
          setIsApproved(false);
          setIsKicked(false);
        } else {
          setIsKicked(true);
        }
      }
    }
  }, [dispatch, students, pendingStudents, currentPoll, kickedStudents]);

  // Monitor for being kicked
  useEffect(() => {
    if (studentName && hasJoined) {
      if (kickedStudents.includes(studentName)) {
        setIsKicked(true);
        setIsApproved(false);
        return;
      }

      const student = students.find(s => s.name === studentName);
      if (isApproved && !student) {
        setIsKicked(true);
        setIsApproved(false);
      }
    }
  }, [students, studentName, isApproved, hasJoined, kickedStudents]);

  // Check if student has answered current poll
  useEffect(() => {
    if (currentPoll && studentName && isApproved) {
      const student = students.find(s => s.name === studentName);
      setHasAnswered(student?.hasAnswered || false);
    }
  }, [currentPoll, studentName, students, isApproved]);

  // WebSocket listeners
  on('newPoll', () => {
    setHasAnswered(false);
    setShowWelcome(false);
    dispatch(setShowResults(false));
  });

  on('pollEnded', () => {
    dispatch(setShowResults(true));
  });

  on('pollCleared', () => {
    setHasAnswered(false);
    dispatch(setShowResults(false));
    if (isApproved && !isKicked) {
      setShowWelcome(true);
    }
  });

  on('voteUpdate', (data: any) => {
    // This helps sync vote updates across tabs
    console.log('Vote update received:', data);
  });

  on('studentRemoved', (data: { name: string }) => {
    if (data.name === studentName) {
      setIsKicked(true);
      setIsApproved(false);
    }
  });

  on('studentApproved', (data: { name: string }) => {
    if (data.name === studentName) {
      setIsWaitingApproval(false);
      setIsApproved(true);
      setIsKicked(false);
      setShowWelcome(true);
    }
  });

  on('studentRejected', (data: { name: string }) => {
    if (data.name === studentName) {
      setIsKicked(true);
      setIsWaitingApproval(false);
      setIsApproved(false);
      setHasJoined(false);
    }
  });

  const handleJoin = (name: string) => {
    if (kickedStudents.includes(name)) {
      setIsKicked(true);
      return;
    }

    dispatch(setStudentName(name));
    sessionStorage.setItem('studentName', name);
    setHasJoined(true);
    setIsWaitingApproval(true);
    setIsKicked(false);
    emit('requestJoin', { name });
  };

  const handleAnswerSubmit = (option: string) => {
    console.log('Submitting vote:', { studentName, option });
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
    setIsKicked(false);
  };

  const handleWelcomeContinue = () => {
    setShowWelcome(false);
  };

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
          {!currentPoll ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full mb-8">
                  <span className="mr-2">⭐</span>
                  <span className="font-medium">Intervue Poll</span>
                </div>
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Waiting for teacher to ask questions...</h1>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-900">Current Question</h2>
                    {currentPoll?.isActive && timeRemaining > 0 && (
                      <div className="flex items-center text-red-600 font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:
                        {(timeRemaining % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                    {!currentPoll?.isActive && (
                      <div className="text-green-600 font-medium">Poll Ended</div>
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
