
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface StudentWelcomeProps {
  studentName: string;
  onContinue: () => void;
  showContinueButton?: boolean;
}

const StudentWelcome: React.FC<StudentWelcomeProps> = ({ studentName, onContinue, showContinueButton = true }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full mb-8">
            <span className="mr-2">⭐</span>
            <span className="font-medium">Intervue Poll</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome!</h1>
          <p className="text-lg text-gray-600 mb-2">
            Hi <strong>{studentName}</strong>, you have been approved to join the poll.
          </p>
          <p className="text-lg text-gray-600">
            You can now participate in live polls and see results in real-time.
          </p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{studentName}</h2>
              <p className="text-gray-600 mb-8">Ready to participate in polls</p>
              
              {showContinueButton && (
                <Button
                  onClick={onContinue}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-3 text-lg rounded-full"
                >
                  Continue to Poll
                </Button>
              )}
              
              {!showContinueButton && (
                <p className="text-gray-500 text-sm">Wait for the teacher to start a poll...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentWelcome;
