
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';

const PollResults: React.FC = () => {
  const { currentPoll, students } = useSelector((state: RootState) => state.poll);

  if (!currentPoll) return null;

  const totalVotes = Object.values(currentPoll.votes).reduce((sum, votes) => sum + votes, 0);
  const answeredStudents = students.filter(s => s.hasAnswered).length;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Live Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">{currentPoll.question}</h3>
            <p className="text-sm text-gray-400">
              {answeredStudents} of {students.length} students answered ({totalVotes} total votes)
            </p>
          </div>

          <div className="space-y-4">
            {currentPoll.options.map((option) => {
              const votes = currentPoll.votes[option] || 0;
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

              return (
                <div key={option} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{option}</span>
                    <span className="text-gray-400">
                      {votes} votes ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-3 bg-gray-700"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollResults;
