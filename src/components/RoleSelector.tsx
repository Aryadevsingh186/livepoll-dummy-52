
import React from 'react';
import { useDispatch } from 'react-redux';
import { setRole } from '../store/pollSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RoleSelector: React.FC = () => {
  const dispatch = useDispatch();

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    dispatch(setRole(role));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full mb-8">
            <span className="mr-2">⭐</span>
            <span className="font-medium">Intervue Poll</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the Live Polling System</h1>
          <p className="text-lg text-gray-600">Please select the role that best describes you to begin using the live polling system</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card 
            className="bg-white border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer group"
            onClick={() => handleRoleSelect('student')}
          >
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-900 mb-2">I'm a Student</CardTitle>
              <CardDescription className="text-gray-600">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white border-2 border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group"
            onClick={() => handleRoleSelect('teacher')}
          >
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-900 mb-2">I'm a Teacher</CardTitle>
              <CardDescription className="text-gray-600">
                Submit answers and view live poll results in real-time.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-3 text-lg rounded-full"
            onClick={() => {
              // This will be handled by individual card clicks
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
