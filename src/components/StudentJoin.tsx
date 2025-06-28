
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserPlus, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Join as Student</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500"
              >
                Join Poll
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Your name will be saved for this tab session
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentJoin;
