
import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';

interface CreatePollProps {
  onClose: () => void;
}

const CreatePoll: React.FC<CreatePollProps> = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [maxTime, setMaxTime] = useState(60);
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
      maxTime,
    });

    onClose();
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm max-w-2xl mx-auto">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Enter your question</h2>
          </div>

          <div className="space-y-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Rahul Bajaj"
              className="w-full text-center text-lg py-3 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              required
            />
            <div className="text-right text-sm text-gray-500">0/100</div>
          </div>

          <div className="space-y-4">
            <Label className="text-gray-700 font-medium">Edit Options</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                {options.slice(0, Math.ceil(options.length / 2)).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder="Rahul Bajaj"
                      className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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
              </div>
              
              <div>
                <div className="mb-6">
                  <Label className="text-gray-700 font-medium mb-2 block">Is it Correct?</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="correct1" value="yes" className="text-purple-600" />
                      <label className="text-gray-700">Yes</label>
                      <input type="radio" name="correct1" value="no" className="text-purple-600 ml-4" />
                      <label className="text-gray-700">No</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" name="correct2" value="yes" className="text-purple-600" />
                      <label className="text-gray-700">Yes</label>
                      <input type="radio" name="correct2" value="no" className="text-purple-600 ml-4" />
                      <label className="text-gray-700">No</label>
                    </div>
                  </div>
                </div>
                {options.slice(Math.ceil(options.length / 2)).map((option, index) => (
                  <div key={index + Math.ceil(options.length / 2)} className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                      {index + Math.ceil(options.length / 2) + 1}
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index + Math.ceil(options.length / 2), e.target.value)}
                      placeholder="Rahul Bajaj"
                      className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      required
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index + Math.ceil(options.length / 2))}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add More option
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Time Limit</Label>
            <Select value={maxTime.toString()} onValueChange={(value) => setMaxTime(parseInt(value))}>
              <SelectTrigger className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
                <SelectItem value="90">90 seconds</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
                <SelectItem value="180">3 minutes</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-center">
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-3 text-lg rounded-full"
            >
              Ask Question
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePoll;
