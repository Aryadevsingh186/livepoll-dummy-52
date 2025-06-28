
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-800">Join as Student</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Join Poll
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
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
