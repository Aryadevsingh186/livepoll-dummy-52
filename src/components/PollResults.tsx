
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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
          const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          
          return (
            <div key={option} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </div>
                  <span className="text-gray-900 font-medium text-lg">{option}</span>
                </div>
                <span className="text-gray-900 font-bold text-lg">{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-purple-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 15 && (
                    <span className="text-white text-xs font-medium">{percentage}%</span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {votes} vote{votes !== 1 ? 's' : ''}
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
