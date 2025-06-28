
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
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Create New Poll</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-white">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your poll question..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="space-y-4">
            <Label className="text-white">Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  required
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeOption(index)}
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
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <Clock className="w-4 h-4 mr-2" />
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
            <div className="flex justify-between text-sm text-gray-400">
              <span>30s</span>
              <span>300s</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500"
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
