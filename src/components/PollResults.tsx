
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const PollResults: React.FC = () => {
  const { currentPoll, students } = useSelector((state: RootState) => state.poll);

  if (!currentPoll) return null;

  const totalStudents = students.length;
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
          // Calculate percentage based on total students (not total votes)
          const percentage = totalStudents > 0 ? Math.round((votes / totalStudents) * 100) : 0;
          
          return (
            <div key={option} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </div>
                  <span className="text-gray-900 font-medium text-lg flex-1">{option}</span>
                </div>
                <div className="text-right">
                  <div className="text-gray-900 font-bold text-lg">{percentage}%</div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {votes} out of {totalStudents} students ({percentage}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Results Message */}
      {!currentPoll.isActive && (
        <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Poll Results</h3>
          <p className="text-green-700">
            Final results: {totalVotes} total votes from {totalStudents} students
          </p>
        </div>
      )}

      {/* Wait Message for Active Polls */}
      {currentPoll.isActive && (
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-6">Wait for the teacher to end the poll to see final results...</p>
        </div>
      )}
    </div>
  );
};

export default PollResults;
