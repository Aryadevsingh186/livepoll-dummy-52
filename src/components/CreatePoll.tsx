
import React, { useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface CreatePollProps {
  onClose: () => void;
}

const CreatePoll: React.FC<CreatePollProps> = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [maxTime, setMaxTime] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState<{ [key: number]: 'yes' | 'no' | null }>({});
  const { emit } = useWebSocket();

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const setCorrectAnswer = (index: number, value: 'yes' | 'no') => {
    setCorrectAnswers(prev => ({
      ...prev,
      [index]: value
    }));
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
      correctAnswers,
    });

    onClose();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Let's Get Started</h1>
        <p className="text-lg text-gray-600 mb-2">
          you'll have the ability to create and manage polls, ask questions, and monitor
        </p>
        <p className="text-lg text-gray-600">
          your students' responses in real-time.
        </p>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center justify-between">
              <Label className="text-gray-700 font-medium text-lg">Enter your question</Label>
              <div className="flex items-center space-x-2">
                <Select value={maxTime.toString()} onValueChange={(value) => setMaxTime(parseInt(value))}>
                  <SelectTrigger className="w-32 border-gray-300 focus:border-purple-500 focus:ring-purple-500">
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
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder=""
                  className="w-full text-lg py-4 px-4 border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                  required
                />
                <div className="absolute bottom-2 right-4 text-sm text-gray-500">
                  {question.length}/100
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Edit Options */}
              <div className="space-y-4">
                <Label className="text-gray-700 font-medium text-lg">Edit Options</Label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                        {index + 1}
                      </div>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder=""
                        className="flex-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        required
                      />
                    </div>
                  ))}
                  
                  {options.length < 6 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOption}
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add More option
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Column - Is it Correct? */}
              <div className="space-y-4">
                <Label className="text-gray-700 font-medium text-lg">Is it Correct?</Label>
                <div className="space-y-6">
                  {options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <div className="text-sm text-gray-600 font-medium">Option {index + 1}</div>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            value="yes"
                            checked={correctAnswers[index] === 'yes'}
                            onChange={() => setCorrectAnswer(index, 'yes')}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            value="no"
                            checked={correctAnswers[index] === 'no'}
                            onChange={() => setCorrectAnswer(index, 'no')}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">No</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center pt-6">
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
    </div>
  );
};

export default CreatePoll;
