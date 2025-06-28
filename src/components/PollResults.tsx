
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Button } from '@/components/ui/button';
import { useWebSocket } from '../hooks/useWebSocket';
import { calculateFromVoteCounts, getVotingProgress } from '../utils/pollCalculations';

const PollResults: React.FC = () => {
  const { currentPoll, students, role } = useSelector((state: RootState) => state.poll);
  const { emit } = useWebSocket();

  if (!currentPoll) return null;

  // Use the poll calculation utility for accurate results
  const pollStats = calculateFromVoteCounts(currentPoll.options, currentPoll.votes || {});
  const votingProgress = getVotingProgress(
    students.length,
    students.filter(s => s.hasAnswered).length
  );

  const handleCreateNewPoll = () => {
    emit('clearPoll', {});
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="bg-gray-800 text-white p-6 rounded-lg mb-8">
        <h2 className="text-xl font-medium">{currentPoll.question}</h2>
      </div>

      {/* Results */}
      <div className="space-y-4 mb-8">
        {pollStats.results.map((result, index) => (
          <div key={result.option} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                  {index + 1}
                </div>
                <span className="text-gray-900 font-medium text-lg flex-1">{result.option}</span>
              </div>
              <div className="text-right">
                <div className="text-gray-900 font-bold text-lg">{result.votes} vote{result.votes !== 1 ? 's' : ''}</div>
                <div className="text-gray-500 text-sm">{result.percentage}%</div>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, result.percentage))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Summary */}
      <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Poll Results</h3>
        <p className="text-green-700">
          Total votes: {pollStats.totalVotes} from {votingProgress.totalStudents} student{votingProgress.totalStudents !== 1 ? 's' : ''}
        </p>
        {currentPoll.isActive && votingProgress.remainingStudents > 0 && (
          <p className="text-blue-600 mt-2">
            Waiting for {votingProgress.remainingStudents} more student{votingProgress.remainingStudents !== 1 ? 's' : ''} to vote ({votingProgress.completionPercentage}% complete)
          </p>
        )}
      </div>

      {/* New Poll Button for Teacher */}
      {role === 'teacher' && (
        <div className="text-center">
          <Button
            onClick={handleCreateNewPoll}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-full"
          >
            Create New Poll
          </Button>
        </div>
      )}
    </div>
  );
};

export default PollResults;
