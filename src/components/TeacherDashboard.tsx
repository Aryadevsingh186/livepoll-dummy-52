
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import CreatePoll from './CreatePoll';
import PollResults from './PollResults';
import StudentList from './StudentList';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BarChart3 } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { currentPoll, students, timeRemaining, pollHistory } = useSelector((state: RootState) => state.poll);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const { emit } = useWebSocket();

  const canCreateNewPoll = !currentPoll || !currentPoll.isActive || students.every(s => s.hasAnswered);

  useEffect(() => {
    if (timeRemaining === 0 && currentPoll?.isActive) {
      setShowCreatePoll(false);
    }
  }, [timeRemaining, currentPoll]);

  const handleCreatePoll = () => {
    setShowCreatePoll(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Teacher Dashboard</h1>
            <p className="text-gray-400">Manage your live polling session</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-blue-600 text-white">
              <Users className="w-4 h-4 mr-1" />
              {students.length} Students
            </Badge>
            {currentPoll?.isActive && (
              <Badge variant="secondary" className="bg-orange-600 text-white">
                <Clock className="w-4 h-4 mr-1" />
                {timeRemaining}s left
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {showCreatePoll ? (
              <CreatePoll onClose={() => setShowCreatePoll(false)} />
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Poll Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentPoll ? (
                    <div className="space-y-4">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-white font-semibold mb-2">Current Poll</h3>
                        <p className="text-gray-300">{currentPoll.question}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant={currentPoll.isActive ? "default" : "secondary"}>
                            {currentPoll.isActive ? "Active" : "Ended"}
                          </Badge>
                          <span className="text-sm text-gray-400">
                            {students.filter(s => s.hasAnswered).length}/{students.length} answered
                          </span>
                        </div>
                      </div>
                      {canCreateNewPoll && (
                        <Button onClick={handleCreatePoll} className="w-full bg-blue-600 hover:bg-blue-500">
                          Create New Poll
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4">No active poll</p>
                      <Button onClick={handleCreatePoll} className="bg-blue-600 hover:bg-blue-500">
                        Create Your First Poll
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentPoll && <PollResults />}

            {pollHistory.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Poll History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pollHistory.slice(-5).map((poll) => (
                      <div key={poll.id} className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-white font-medium">{poll.question}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(poll.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <StudentList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
