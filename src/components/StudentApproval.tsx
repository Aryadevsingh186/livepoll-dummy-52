
import React from 'react';
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
  const { emit } = useWebSocket();

  const handleApprove = (studentName: string) => {
    dispatch(approveStudent(studentName));
    emit('approveStudent', { studentName });
  };

  const handleReject = (studentName: string) => {
    dispatch(rejectStudent(studentName));
    emit('rejectStudent', { studentName });
  };

  if (pendingStudents.length === 0) return null;

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
            <div key={student.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
              <span className="font-medium text-gray-900">{student.name}</span>
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
