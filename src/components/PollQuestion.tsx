import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Poll } from '../store/pollSlice';
import { RootState } from '../store';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PollQuestionProps {
  poll: Poll;
  onSubmit: (option: string) => void;
}

const PollQuestion: React.FC<PollQuestionProps> = ({ poll, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { studentName, students } = useSelector((state: RootState) => state.poll);

  // Check if current student has already voted
  useEffect(() => {
    if (studentName && students.length > 0) {
      const currentStudent = students.find(s => s.name === studentName);
      if (currentStudent?.hasAnswered) {
        setHasSubmitted(true);
        setIsSubmitting(true); // Keep form disabled
      }
    }
  }, [studentName, students]);

  // Reset state when new poll is created
  useEffect(() => {
    setSelectedOption('');
    setIsSubmitting(false);
    setHasSubmitted(false);
  }, [poll.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Multiple layers of protection
    if (!selectedOption || isSubmitting || hasSubmitted) {
      console.log('Submit blocked:', { selectedOption, isSubmitting, hasSubmitted });
      return;
    }

    // Check if student has already voted (final check)
    const currentStudent = students.find(s => s.name === studentName);
    if (currentStudent?.hasAnswered) {
      console.log('Submit blocked: Student already voted');
      setHasSubmitted(true);
      setIsSubmitting(true);
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(true);
    
    try {
      console.log(`Submitting vote: ${studentName} -> ${selectedOption}`);
      onSubmit(selectedOption);
      // Keep the form disabled after submission
    } catch (error) {
      console.error('Error submitting vote:', error);
      // Only reset if there was an actual error
      setIsSubmitting(false);
      setHasSubmitted(false);
    }
  };

  const canSubmit = selectedOption && !isSubmitting && !hasSubmitted && poll.isActive;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="bg-gray-800 text-white p-6 rounded-lg mb-8">
        <h2 className="text-xl font-medium">{poll.question}</h2>
      </div>

      {hasSubmitted ? (
        <div className="text-center bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-green-600 text-xl font-semibold mb-2">✓ Vote Submitted Successfully!</div>
          <p className="text-green-700">Thank you for participating. Please wait for the results.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup 
            value={selectedOption} 
            onValueChange={setSelectedOption} 
            disabled={isSubmitting || !poll.isActive}
          >
            <div className="space-y-4">
              {poll.options.map((option, index) => (
                <div 
                  key={option} 
                  className={`flex items-center space-x-4 p-4 bg-purple-100 hover:bg-purple-200 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer ${(isSubmitting || !poll.isActive) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isSubmitting && poll.isActive && setSelectedOption(option)}
                >
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <RadioGroupItem 
                    value={option} 
                    id={`option-${index}`} 
                    className="text-purple-600" 
                    disabled={isSubmitting || !poll.isActive}
                  />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className={`text-gray-900 cursor-pointer flex-1 font-medium text-lg ${(isSubmitting || !poll.isActive) ? 'cursor-not-allowed' : ''}`}
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="text-center mt-8">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-12 py-3 text-lg rounded-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PollQuestion;
