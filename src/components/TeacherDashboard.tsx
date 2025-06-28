
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
import { Clock, Users, BarChart3, Plus, GraduationCap, Trash2 } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { currentPoll, students, timeRemaining, showResults } = useSelector((state: RootState) => state.poll);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const { emit } = useWebSocket();

  const canCreateNewPoll = !currentPoll || !currentPoll.isActive;

  useEffect(() => {
    if (timeRemaining === 0 && currentPoll?.isActive) {
      setShowCreatePoll(false);
    }
  }, [timeRemaining, currentPoll]);

  const handleCreatePoll = () => {
    setShowCreatePoll(true);
  };

  const handleRemovePoll = () => {
    if (window.confirm('Are you sure you want to remove this poll? This action cannot be undone.')) {
      emit('removePoll', {});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Teacher Dashboard</h1>
                <p className="text-gray-600">Create engaging polls and track student participation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 font-medium">
                <Users className="w-4 h-4 mr-1" />
                {students.length} Students
              </Badge>
              {currentPoll && (
                <Badge variant="secondary" className={`${currentPoll.isActive ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-red-100 text-red-800 border-red-200'} font-medium`}>
                  <Clock className="w-4 h-4 mr-1" />
                  {currentPoll.isActive ? `${timeRemaining}s` : 'Poll Ended'}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {showCreatePoll ? (
                <CreatePoll onClose={() => setShowCreatePoll(false)} />
              ) : (
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800 flex items-center text-xl font-semibold">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Poll Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentPoll ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-gray-800 font-semibold text-lg mb-1">Current Poll</h3>
                              <p className="text-gray-600">{currentPoll.question}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleRemovePoll}
                              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant={currentPoll.isActive ? "default" : "secondary"} className={currentPoll.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600"}>
                              {currentPoll.isActive ? "🟢 Active" : "🔴 Ended"}
                            </Badge>
                            <span className="text-gray-600 font-medium">
                              {students.filter(s => s.hasAnswered).length}/{students.length} responses
                            </span>
                            {currentPoll && (
                              <Badge variant="secondary" className={`${currentPoll.isActive ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'} border-gray-200`}>
                                <Clock className="w-4 h-4 mr-1" />
                                {currentPoll.isActive ? `${timeRemaining}s` : 'Finished'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {canCreateNewPoll && (
                          <Button 
                            onClick={handleCreatePoll} 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Poll
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-gray-600 mb-6 text-lg">Ready to engage your students?</p>
                        <Button 
                          onClick={handleCreatePoll} 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Create Your First Poll
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {currentPoll && (students.some(s => s.hasAnswered) || !currentPoll.isActive) && <PollResults />}
            </div>

            <div>
              <StudentList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
