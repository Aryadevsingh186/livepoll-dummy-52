import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setStudentName, setShowResults, leavePoll } from '../store/pollSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import StudentJoin from './StudentJoin';
import PollQuestion from './PollQuestion';
import PollResults from './PollResults';
import KickedOut from './KickedOut';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, BookOpen, LogOut, Timer } from 'lucide-react';

const StudentInterface: React.FC = () => {
  const dispatch = useDispatch();
  const { currentPoll, studentName, timeRemaining, showResults, students } = useSelector((state: RootState) => state.poll);
  const { emit, on } = useWebSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isKickedOut, setIsKickedOut] = useState(false);

  useEffect(() => {
    const savedName = sessionStorage.getItem('studentName');
    if (savedName) {
      dispatch(setStudentName(savedName));
      setHasJoined(true);
      emit('joinAsStudent', { name: savedName });
    }
  }, [dispatch, emit]);

  on('newPoll', () => {
    console.log('New poll started - resetting state');
    setHasAnswered(false);
    dispatch(setShowResults(false));
  });

  on('pollEnded', () => {
    console.log('Poll ended - showing results');
    dispatch(setShowResults(true));
  });

  on('showResults', () => {
    console.log('Show results event received');
    dispatch(setShowResults(true));
  });

  on('pollRemoved', () => {
    console.log('Poll removed - resetting state');
    setHasAnswered(false);
    dispatch(setShowResults(false));
  });

  on('studentRemoved', (data: { name: string }) => {
    if (data.name === studentName) {
      console.log('Student was kicked out');
      setIsKickedOut(true);
    }
  });

  on('timeUpdate', (data: { timeRemaining: number }) => {
    console.log('Time update received:', data.timeRemaining);
  });

  useEffect(() => {
    if (timeRemaining === 0 && currentPoll) {
      console.log('Timer reached 0 - showing results');
      dispatch(setShowResults(true));
    }
  }, [timeRemaining, currentPoll, dispatch]);

  const handleJoin = (name: string) => {
    dispatch(setStudentName(name));
    sessionStorage.setItem('studentName', name);
    setHasJoined(true);
    setIsKickedOut(false);
    emit('joinAsStudent', { name });
  };

  const handleAnswerSubmit = (option: string) => {
    console.log('Answer submitted:', option);
    emit('submitVote', { studentName, option });
    setHasAnswered(true);
  };

  const handleLeavePoll = () => {
    if (window.confirm('Are you sure you want to leave the poll?')) {
      sessionStorage.removeItem('studentName');
      emit('removeStudent', { studentName });
      dispatch(leavePoll());
      setHasJoined(false);
      setHasAnswered(false);
      setIsKickedOut(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Student Portal</h1>
                <p className="text-gray-600">Welcome, {studentName}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 font-medium">
                <Users className="w-4 h-4 mr-1" />
                {students.length} Students
              </Badge>
              {currentPoll && (
                <Badge variant="secondary" className={`${currentPoll.isActive ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-red-100 text-red-800 border-red-200'} font-medium`}>
                  <Timer className="w-4 h-4 mr-1" />
                  {currentPoll.isActive ? `${timeRemaining}s` : 'Time Up!'}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeavePoll}
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Leave
              </Button>
            </div>
          </div>

          {!currentPoll ? (
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="text-center py-20">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Waiting for Poll</h2>
                  <p className="text-gray-600 text-lg">Your teacher is preparing an awesome poll. Get ready to participate!</p>
                  <div className="flex justify-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : currentPoll.isActive && !hasAnswered && !showResults ? (
            <PollQuestion poll={currentPoll} onSubmit={handleAnswerSubmit} />
          ) : (
            <div className="space-y-6">
              {hasAnswered && !showResults && currentPoll.isActive && (
                <Card className="bg-green-50 border border-green-200 shadow-sm">
                  <CardContent className="text-center py-8">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-green-600 text-xl">✓</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Answer Submitted!</h2>
                    <p className="text-gray-600">
                      Waiting for other students or timer to complete...
                    </p>
                  </CardContent>
                </Card>
              )}
              {(showResults || !currentPoll?.isActive) && <PollResults />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInterface;
