
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { approveStudent, rejectStudent } from '../store/pollSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, Clock } from 'lucide-react';

const StudentApproval: React.FC = () => {
  const dispatch = useDispatch();
  const { pendingStudents } = useSelector((state: RootState) => state.poll);
  const { emit, on } = useWebSocket();

  useEffect(() => {
    console.log('StudentApproval - Pending students:', pendingStudents);
  }, [pendingStudents]);

  on('studentJoinRequest', (data: { name: string }) => {
    console.log('StudentApproval - Received join request:', data.name);
    // The request is already handled by the websocket service
  });

  const handleApprove = (studentName: string) => {
    console.log('Approving student:', studentName);
    emit('approveStudent', { studentName });
  };

  const handleReject = (studentName: string) => {
    console.log('Rejecting student:', studentName);
    emit('rejectStudent', { studentName });
  };

  if (pendingStudents.length === 0) {
    console.log('No pending students to show');
    return null;
  }

  console.log('Rendering StudentApproval with', pendingStudents.length, 'pending students');

  return (
    <Card className="mb-6 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Student Join Requests ({pendingStudents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingStudents.map((student) => (
            <div key={student.id} className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-medium">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-gray-900">{student.name}</span>
                  <p className="text-sm text-gray-500">wants to join the poll</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleApprove(student.name)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(student.name)}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <UserX className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentApproval;
