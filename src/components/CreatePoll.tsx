
import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Plus, Minus, Clock } from 'lucide-react';

interface CreatePollProps {
  onClose: () => void;
}

const CreatePoll: React.FC<CreatePollProps> = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [maxTime, setMaxTime] = useState([60]);
  const { emit } = useWebSocket();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || options.some(opt => !opt.trim())) {
      return;
    }

    emit('createPoll', {
      question: question.trim(),
      options: options.filter(opt => opt.trim()),
      maxTime: maxTime[0],
    });

    onClose();
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 text-xl">Create New Poll</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-gray-700">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your poll question..."
              className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-gray-700">Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                  required
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-600" />
              Time Limit: {maxTime[0]} seconds
            </Label>
            <Slider
              value={maxTime}
              onValueChange={setMaxTime}
              max={300}
              min={30}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>30s</span>
              <span>300s</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Poll
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePoll;
