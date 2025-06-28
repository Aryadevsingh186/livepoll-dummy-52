
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setStudentName, setShowResults, leavePoll } from '../store/pollSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import StudentJoin from './StudentJoin';
import PollQuestion from './PollQuestion';
import PollResults from './PollResults';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Zap, BookOpen, LogOut } from 'lucide-react';

const StudentInterface: React.FC = () => {
  const dispatch = useDispatch();
  const { currentPoll, studentName, timeRemaining, showResults, students } = useSelector((state: RootState) => state.poll);
  const { emit, on } = useWebSocket();
  const [hasJoined, setHasJoined] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

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

  on('pollRemoved', () => {
    setHasAnswered(false);
    dispatch(setShowResults(false));
  });

  const handleJoin = (name: string) => {
    dispatch(setStudentName(name));
    sessionStorage.setItem('studentName', name);
    setHasJoined(true);
    emit('joinAsStudent', { name });
  };

  const handleAnswerSubmit = (option: string) => {
    emit('submitVote', { studentName, option });
    setHasAnswered(true);
    dispatch(setShowResults(true));
  };

  const handleLeavePoll = () => {
    if (window.confirm('Are you sure you want to leave the poll?')) {
      sessionStorage.removeItem('studentName');
      emit('removeStudent', { studentName });
      dispatch(leavePoll());
      setHasJoined(false);
      setHasAnswered(false);
    }
  };

  if (!hasJoined) {
    return <StudentJoin onJoin={handleJoin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decoration with better contrast */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with better contrast */}
          <div className="flex justify-between items-center mb-8 bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-600 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-100 mb-1">Student Portal</h1>
                <p className="text-gray-300 flex items-center font-medium">
                  <Zap className="w-4 h-4 mr-1" />
                  Welcome, {studentName}!
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-600/90 text-white border-green-500 backdrop-blur-sm font-semibold">
                <Users className="w-4 h-4 mr-1" />
                {students.length} Students
              </Badge>
              {currentPoll?.isActive && !hasAnswered && (
                <Badge variant="secondary" className="bg-orange-600/90 text-white border-orange-500 backdrop-blur-sm animate-pulse font-semibold">
                  <Clock className="w-4 h-4 mr-1" />
                  {timeRemaining}s left
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeavePoll}
                className="bg-red-600/90 text-white border-red-500 hover:bg-red-700/90"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Poll
              </Button>
            </div>
          </div>

          {!currentPoll ? (
            <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-600 shadow-2xl">
              <CardContent className="text-center py-20">
                <div className="space-y-6">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=200&h=200&fit=crop&crop=face"
                      alt="Student waiting" 
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-500"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-100">Waiting for Poll</h2>
                  <p className="text-gray-300 text-lg font-medium">Your teacher is preparing an awesome poll. Get ready to participate!</p>
                  <div className="flex justify-center">
                    <div className="animate-bounce">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-1 inline-block"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full mr-1 inline-block animate-pulse"></div>
                      <div className="w-3 h-3 bg-indigo-400 rounded-full inline-block"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : currentPoll.isActive && !hasAnswered && !showResults ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=200&fit=crop"
                  alt="Students collaborating" 
                  className="w-full max-w-md h-48 mx-auto rounded-2xl object-cover border-4 border-gray-500 shadow-2xl"
                />
              </div>
              <PollQuestion poll={currentPoll} onSubmit={handleAnswerSubmit} />
            </div>
          ) : (
            <div className="space-y-6">
              {hasAnswered && (
                <Card className="bg-green-800/90 backdrop-blur-lg border-green-600 shadow-2xl">
                  <CardContent className="text-center py-8">
                    <div className="flex items-center justify-center mb-4">
                      <img 
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&crop=face"
                        alt="Success" 
                        className="w-16 h-16 rounded-full object-cover border-3 border-green-400"
                      />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">🎉 Answer Submitted!</h2>
                    <p className="text-gray-300 text-lg font-medium">Amazing! Your response has been recorded. Check out the live results below!</p>
                  </CardContent>
                </Card>
              )}
              <div className="text-center mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=200&fit=crop"
                  alt="Data visualization" 
                  className="w-full max-w-lg h-48 mx-auto rounded-2xl object-cover border-4 border-gray-500 shadow-2xl"
                />
              </div>
              <PollResults />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentInterface;
