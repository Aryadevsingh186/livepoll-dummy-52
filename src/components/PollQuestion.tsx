
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
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <HelpCircle className="w-5 h-5 mr-2" />
          Answer the Question
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">{poll.question}</h2>
            
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <div className="space-y-3">
                {poll.options.map((option, index) => (
                  <div key={option} className="flex items-center space-x-3 p-3 bg-gray-600 rounded-lg hover:bg-gray-550 transition-colors">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="text-white cursor-pointer flex-1 font-medium"
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
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Submit Answer
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PollQuestion;
