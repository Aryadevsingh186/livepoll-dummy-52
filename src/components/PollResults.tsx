
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Button } from '@/components/ui/button';

const PollResults: React.FC = () => {
  const { currentPoll } = useSelector((state: RootState) => state.poll);

  if (!currentPoll) return null;

  const totalVotes = Object.values(currentPoll.votes).reduce((sum, votes) => sum + votes, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="bg-gray-800 text-white p-6 rounded-lg mb-8">
        <h2 className="text-xl font-medium">{currentPoll.question}</h2>
      </div>

      {/* Results */}
      <div className="space-y-4 mb-8">
        {currentPoll.options.map((option, index) => {
          const votes = currentPoll.votes[option] || 0;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
          
          return (
            <div key={option} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-900 font-medium text-lg">{option}</span>
                  <span className="text-gray-600 font-medium">{percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wait Message */}
      <div className="text-center">
        <p className="text-gray-600 text-lg mb-6">Wait for the teacher to ask a new question..</p>
      </div>
    </div>
  );
};

export default PollResults;
