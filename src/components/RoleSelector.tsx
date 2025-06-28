
import React from 'react';
import { useDispatch } from 'react-redux';
import { setRole } from '../store/pollSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap } from 'lucide-react';

const RoleSelector: React.FC = () => {
  const dispatch = useDispatch();

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    dispatch(setRole(role));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Live Polling System</h1>
          <p className="text-xl text-gray-600">Choose your role to get started</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleRoleSelect('teacher')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Teacher</CardTitle>
              <CardDescription className="text-gray-600">
                Create polls and manage students
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>• Create new polls</li>
                <li>• View live results</li>
                <li>• Manage students</li>
                <li>• Set poll timers</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Continue as Teacher
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleRoleSelect('student')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Student</CardTitle>
              <CardDescription className="text-gray-600">
                Join polls and submit answers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>• Join active polls</li>
                <li>• Submit answers</li>
                <li>• View live results</li>
                <li>• Real-time updates</li>
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Continue as Student
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
