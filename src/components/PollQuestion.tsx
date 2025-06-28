
import React, { useState } from 'react';
import { Poll } from '../store/pollSlice';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';

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
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center text-xl">
          <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
          Answer the Question
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{poll.question}</h2>
            
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <div key={option} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} className="text-blue-600" />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="text-gray-800 cursor-pointer flex-1 font-medium"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            disabled={!selectedOption}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3"
          >
            Submit Answer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PollQuestion;
