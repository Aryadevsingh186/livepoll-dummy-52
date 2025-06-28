
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface StudentJoinProps {
  onJoin: (name: string) => void;
}

const StudentJoin: React.FC<StudentJoinProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { students } = useSelector((state: RootState) => state.poll);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (students.some(s => s.name.toLowerCase() === name.trim().toLowerCase())) {
      setError('This name is already taken. Please choose a different name.');
      return;
    }

    setError('');
    onJoin(name.trim());
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full mb-8">
            <span className="mr-2">⭐</span>
            <span className="font-medium">Intervue Poll</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Let's Get Started</h1>
          <p className="text-lg text-gray-600 mb-2">
            If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live
          </p>
          <p className="text-lg text-gray-600">
            polls, and see how your responses compare with your classmates
          </p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Enter your Name</h2>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  className="w-full max-w-md mx-auto text-center text-lg py-3 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="text-center text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="text-center">
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-3 text-lg rounded-full"
                >
                  Continue
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentJoin;
