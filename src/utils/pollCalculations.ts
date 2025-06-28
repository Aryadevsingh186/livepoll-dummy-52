
export interface VoteCount {
  [option: string]: number;
}

export interface PollResult {
  option: string;
  votes: number;
  percentage: number;
}

export interface PollStats {
  totalVotes: number;
  results: PollResult[];
  voteCounts: VoteCount;
}

/**
 * Core poll counting logic
 * Takes an array of options and votes, returns comprehensive poll statistics
 */
export const calculatePollResults = (
  options: string[],
  votes: string[]
): PollStats => {
  // Initialize vote counts for all options (including those with 0 votes)
  const voteCounts: VoteCount = {};
  options.forEach(option => {
    voteCounts[option] = 0;
  });

  // Count actual votes
  votes.forEach(vote => {
    if (voteCounts.hasOwnProperty(vote)) {
      voteCounts[vote]++;
    }
  });

  const totalVotes = votes.length;

  // Calculate results with percentages
  const results: PollResult[] = options.map(option => {
    const voteCount = voteCounts[option];
    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
    
    return {
      option,
      votes: voteCount,
      percentage
    };
  });

  return {
    totalVotes,
    results,
    voteCounts
  };
};

/**
 * Convert vote counts object to poll statistics
 * Used when we already have vote counts from Redux state
 */
export const calculateFromVoteCounts = (
  options: string[],
  voteCounts: VoteCount
): PollStats => {
  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

  const results: PollResult[] = options.map(option => {
    const voteCount = voteCounts[option] || 0;
    const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
    
    return {
      option,
      votes: voteCount,
      percentage
    };
  });

  return {
    totalVotes,
    results,
    voteCounts
  };
};

/**
 * Get all student votes as an array from Redux state
 * This helps us validate vote counts and recalculate if needed
 */
export const getStudentVotesArray = (students: Array<{ selectedOption?: string; hasAnswered: boolean }>): string[] => {
  return students
    .filter(student => student.hasAnswered && student.selectedOption)
    .map(student => student.selectedOption!)
    .filter(Boolean);
};

/**
 * Validate that vote counts match actual student votes
 * Returns true if counts are accurate, false if recalculation is needed
 */
export const validateVoteCounts = (
  options: string[],
  voteCounts: VoteCount,
  studentVotes: string[]
): boolean => {
  const calculatedStats = calculatePollResults(options, studentVotes);
  
  // Check if stored counts match calculated counts
  for (const option of options) {
    if ((voteCounts[option] || 0) !== (calculatedStats.voteCounts[option] || 0)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Recalculate and fix vote counts from student data
 * Use this when vote counts get out of sync
 */
export const recalculateVoteCounts = (
  options: string[],
  students: Array<{ selectedOption?: string; hasAnswered: boolean }>
): VoteCount => {
  const studentVotes = getStudentVotesArray(students);
  const stats = calculatePollResults(options, studentVotes);
  return stats.voteCounts;
};

/**
 * Check if all students have voted
 */
export const checkAllStudentsVoted = (
  totalStudents: number,
  votedStudents: number
): boolean => {
  return totalStudents > 0 && votedStudents === totalStudents;
};

/**
 * Get voting progress information
 */
export const getVotingProgress = (
  totalStudents: number,
  votedStudents: number
) => {
  const percentage = totalStudents > 0 ? Math.round((votedStudents / totalStudents) * 100) : 0;
  
  return {
    votedStudents,
    totalStudents,
    remainingStudents: totalStudents - votedStudents,
    completionPercentage: percentage,
    isComplete: checkAllStudentsVoted(totalStudents, votedStudents)
  };
};
