
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
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center text-xl font-semibold">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Live Results
          <TrendingUp className="w-4 h-4 ml-2 text-green-600" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-gray-800 font-semibold text-lg mb-2">{currentPoll.question}</h3>
            <p className="text-gray-600 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {answeredStudents} of {students.length} students responded ({totalVotes} total votes)
            </p>
          </div>

          <div className="space-y-4">
            {currentPoll.options.map((option, index) => {
              const votes = currentPoll.votes[option] || 0;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
              const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50'];
              const textColors = ['text-blue-800', 'text-green-800', 'text-purple-800', 'text-orange-800'];
              
              const bgColor = bgColors[index % bgColors.length];
              const textColor = textColors[index % textColors.length];
              const barColor = colors[index % colors.length];

              return (
                <div key={option} className={`space-y-3 ${bgColor} p-4 rounded-lg border border-gray-200`}>
                  <div className="flex justify-between items-center">
                    <span className={`${textColor} font-semibold text-lg`}>{option}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-800">
                        {votes}
                      </span>
                      <span className="text-gray-600 font-medium">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className="h-3 bg-gray-200"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-3 ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {votes > 0 && (
                    <div className="flex justify-end">
                      <span className="text-sm text-green-600 font-medium">
                        ✓ {votes} vote{votes !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalVotes === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-600 text-lg">Waiting for student responses...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PollResults;
