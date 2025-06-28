
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
import { Clock, Users, BarChart3, Plus, GraduationCap, Zap } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { currentPoll, students, timeRemaining, showResults } = useSelector((state: RootState) => state.poll);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const { emit } = useWebSocket();

  // Allow creating new poll after current one ends or if no poll exists
  const canCreateNewPoll = !currentPoll || !currentPoll.isActive;

  useEffect(() => {
    if (timeRemaining === 0 && currentPoll?.isActive) {
      setShowCreatePoll(false);
    }
  }, [timeRemaining, currentPoll]);

  const handleCreatePoll = () => {
    setShowCreatePoll(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decoration with better contrast */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header with better contrast */}
          <div className="flex justify-between items-center mb-8 bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-gray-600 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-100 mb-2 flex items-center">
                  Teacher Dashboard
                  <Zap className="w-8 h-8 ml-2 text-yellow-400" />
                </h1>
                <p className="text-gray-300 text-lg font-medium">Create engaging polls and track student participation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-600/90 text-white border-blue-500 backdrop-blur-sm text-lg px-4 py-2 font-semibold">
                <Users className="w-5 h-5 mr-2" />
                {students.length} Students
              </Badge>
              {currentPoll?.isActive && (
                <Badge variant="secondary" className="bg-orange-600/90 text-white border-orange-500 backdrop-blur-sm text-lg px-4 py-2 animate-pulse font-semibold">
                  <Clock className="w-5 h-5 mr-2" />
                  {timeRemaining}s left
                </Badge>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {showCreatePoll ? (
                <CreatePoll onClose={() => setShowCreatePoll(false)} />
              ) : (
                <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-600 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-gray-100 flex items-center text-2xl font-bold">
                      <BarChart3 className="w-6 h-6 mr-3" />
                      Poll Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentPoll ? (
                      <div className="space-y-6">
                        <div className="bg-gray-700/80 p-6 rounded-xl border border-gray-600">
                          <div className="flex items-center mb-4">
                            <img 
                              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=80&h=80&fit=crop"
                              alt="Active poll" 
                              className="w-12 h-12 rounded-lg object-cover border-2 border-gray-500 mr-4"
                            />
                            <div>
                              <h3 className="text-gray-100 font-bold text-xl mb-2">Current Poll</h3>
                              <p className="text-gray-300 text-lg font-medium">{currentPoll.question}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6 mt-4">
                            <Badge variant={currentPoll.isActive ? "default" : "secondary"} className="text-lg px-4 py-2 font-semibold">
                              {currentPoll.isActive ? "🟢 Active" : "🔴 Ended"}
                            </Badge>
                            <span className="text-gray-300 font-bold text-lg">
                              {students.filter(s => s.hasAnswered).length}/{students.length} responses
                            </span>
                          </div>
                        </div>
                        {canCreateNewPoll && (
                          <Button 
                            onClick={handleCreatePoll} 
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
                          >
                            <Plus className="w-6 h-6 mr-2" />
                            Create New Poll
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <img 
                          src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=150&fit=crop"
                          alt="Start teaching" 
                          className="w-32 h-24 mx-auto rounded-xl object-cover border-3 border-gray-500 mb-6"
                        />
                        <p className="text-gray-300 mb-6 text-xl font-medium">Ready to engage your students?</p>
                        <Button 
                          onClick={handleCreatePoll} 
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold py-4 px-8 text-lg rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
                        >
                          <Plus className="w-6 h-6 mr-2" />
                          Create Your First Poll
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Show results when poll is active and has votes or when poll ended */}
              {currentPoll && (showResults || !currentPoll.isActive || students.some(s => s.hasAnswered)) && <PollResults />}
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
