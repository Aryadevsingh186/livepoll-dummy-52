import React, { useState } from 'react';
import { Poll } from '../store/pollSlice';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption && !isSubmitting) {
      setIsSubmitting(true);
      try {
        onSubmit(selectedOption);
        // Keep the button disabled to prevent multiple submissions
      } catch (error) {
        console.error('Error submitting vote:', error);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="bg-gray-800 text-white p-6 rounded-lg mb-8">
        <h2 className="text-xl font-medium">{poll.question}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption} disabled={isSubmitting}>
          <div className="space-y-4">
            {poll.options.map((option, index) => (
              <div 
                key={option} 
                className={`flex items-center space-x-4 p-4 bg-purple-100 hover:bg-purple-200 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isSubmitting && setSelectedOption(option)}
              >
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`} 
                  className="text-purple-600" 
                  disabled={isSubmitting}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className={`text-gray-900 cursor-pointer flex-1 font-medium text-lg ${isSubmitting ? 'cursor-not-allowed' : ''}`}
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
            disabled={!selectedOption || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-12 py-3 text-lg rounded-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PollQuestion;
