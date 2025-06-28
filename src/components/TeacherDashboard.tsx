
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
  const { currentPoll, students, timeRemaining, pollHistory } = useSelector((state: RootState) => state.poll);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-80 h-80 bg-blue-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-indigo-600 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="flex justify-between items-center mb-8 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                  Teacher Dashboard
                  <Zap className="w-8 h-8 ml-2 text-yellow-400" />
                </h1>
                <p className="text-blue-200 text-lg">Create engaging polls and track student participation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-sm text-lg px-4 py-2">
                <Users className="w-5 h-5 mr-2" />
                {students.length} Students
              </Badge>
              {currentPoll?.isActive && (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 backdrop-blur-sm text-lg px-4 py-2 animate-pulse">
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
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center text-2xl">
                      <BarChart3 className="w-6 h-6 mr-3" />
                      Poll Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentPoll ? (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 rounded-xl border border-white/10">
                          <div className="flex items-center mb-4">
                            <img 
                              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=80&h=80&fit=crop"
                              alt="Active poll" 
                              className="w-12 h-12 rounded-lg object-cover border-2 border-white/20 mr-4"
                            />
                            <div>
                              <h3 className="text-white font-bold text-xl mb-2">Current Poll</h3>
                              <p className="text-blue-200 text-lg">{currentPoll.question}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6 mt-4">
                            <Badge variant={currentPoll.isActive ? "default" : "secondary"} className="text-lg px-4 py-2">
                              {currentPoll.isActive ? "🟢 Active" : "🔴 Ended"}
                            </Badge>
                            <span className="text-blue-300 font-medium text-lg">
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
                          className="w-32 h-24 mx-auto rounded-xl object-cover border-3 border-white/20 mb-6"
                        />
                        <p className="text-blue-200 mb-6 text-xl">Ready to engage your students?</p>
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

              {currentPoll && <PollResults />}

              {pollHistory.length > 0 && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl flex items-center">
                      <BarChart3 className="w-6 h-6 mr-3" />
                      Poll History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pollHistory.slice(-5).map((poll) => (
                        <div key={poll.id} className="bg-slate-800/50 p-4 rounded-xl border border-white/10 hover:bg-slate-700/50 transition-colors">
                          <p className="text-white font-semibold text-lg">{poll.question}</p>
                          <p className="text-blue-300 text-sm mt-2">
                            📅 {new Date(poll.createdAt).toLocaleString()}
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
    </div>
  );
};

export default TeacherDashboard;
