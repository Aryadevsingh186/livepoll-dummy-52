
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOption) {
      onSubmit(selectedOption);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Question Header */}
      <div className="bg-gray-800 text-white p-6 rounded-lg mb-8">
        <h2 className="text-xl font-medium">{poll.question}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          <div className="space-y-4">
            {poll.options.map((option, index) => (
              <div 
                key={option} 
                className="flex items-center space-x-4 p-4 bg-purple-100 hover:bg-purple-200 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer"
                onClick={() => setSelectedOption(option)}
              >
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <RadioGroupItem value={option} id={`option-${index}`} className="text-purple-600" />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="text-gray-900 cursor-pointer flex-1 font-medium text-lg"
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
            disabled={!selectedOption}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-12 py-3 text-lg rounded-full"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PollQuestion;
