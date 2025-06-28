
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setStudentName, setShowResults } from '../store/pollSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import StudentJoin from './StudentJoin';
import PollQuestion from './PollQuestion';
import PollResults from './PollResults';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';

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

  if (!hasJoined) {
    return <StudentJoin onJoin={handleJoin} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Student Portal</h1>
            <p className="text-gray-400">Welcome, {studentName}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-600 text-white">
              <Users className="w-4 h-4 mr-1" />
              {students.length} Students
            </Badge>
            {currentPoll?.isActive && !hasAnswered && (
              <Badge variant="secondary" className="bg-orange-600 text-white">
                <Clock className="w-4 h-4 mr-1" />
                {timeRemaining}s left
              </Badge>
            )}
          </div>
        </div>

        {!currentPoll ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-16">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Waiting for Poll</h2>
                <p className="text-gray-400">Your teacher hasn't started a poll yet. Please wait...</p>
              </div>
            </CardContent>
          </Card>
        ) : currentPoll.isActive && !hasAnswered && !showResults ? (
          <PollQuestion poll={currentPoll} onSubmit={handleAnswerSubmit} />
        ) : (
          <div className="space-y-6">
            {hasAnswered && (
              <Card className="bg-green-900 border-green-700">
                <CardContent className="text-center py-6">
                  <h2 className="text-xl font-semibold text-green-200 mb-2">Answer Submitted!</h2>
                  <p className="text-green-300">Thank you for participating. Results will appear below.</p>
                </CardContent>
              </Card>
            )}
            <PollResults />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInterface;
