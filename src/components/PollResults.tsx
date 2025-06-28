
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

const PollResults: React.FC = () => {
  const { currentPoll, students } = useSelector((state: RootState) => state.poll);

  if (!currentPoll) return null;

  const totalVotes = Object.values(currentPoll.votes).reduce((sum, votes) => sum + votes, 0);
  const answeredStudents = students.filter(s => s.hasAnswered).length;

  return (
    <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-600 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center text-2xl font-bold">
          <BarChart3 className="w-6 h-6 mr-3" />
          Live Results
          <TrendingUp className="w-5 h-5 ml-2 text-green-400" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-gray-700/80 p-6 rounded-xl border border-gray-600">
            <div className="flex items-center mb-4">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=60&h=60&fit=crop"
                alt="Poll data" 
                className="w-12 h-12 rounded-lg object-cover border-2 border-gray-500 mr-4"
              />
              <div>
                <h3 className="text-gray-100 font-bold text-xl mb-2">{currentPoll.question}</h3>
                <p className="text-gray-300 flex items-center font-medium">
                  <Users className="w-4 h-4 mr-1" />
                  {answeredStudents} of {students.length} students responded ({totalVotes} total votes)
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {currentPoll.options.map((option, index) => {
              const votes = currentPoll.votes[option] || 0;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const colors = ['from-blue-500 to-blue-600', 'from-green-500 to-green-600', 'from-purple-500 to-purple-600', 'from-orange-500 to-orange-600'];
              const bgColor = colors[index % colors.length];

              return (
                <div key={option} className="space-y-3 bg-gray-700/60 p-4 rounded-xl border border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-100 font-bold text-lg">{option}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-100">
                        {votes}
                      </span>
                      <span className="text-gray-300 font-bold">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className="h-4 bg-gray-600 border border-gray-500"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-4 bg-gradient-to-r ${bgColor} rounded-full transition-all duration-500 shadow-lg`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {votes > 0 && (
                    <div className="flex justify-end">
                      <span className="text-sm text-green-400 font-bold">
                        🎯 {votes} vote{votes !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalVotes === 0 && (
            <div className="text-center py-8">
              <img 
                src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=100&h=100&fit=crop&crop=face"
                alt="Waiting for responses" 
                className="w-16 h-16 rounded-full mx-auto object-cover border-3 border-gray-500 mb-4"
              />
              <p className="text-gray-300 text-lg font-medium">Waiting for student responses...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PollResults;
