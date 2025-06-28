
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserX, CheckCircle, Clock } from 'lucide-react';

const StudentList: React.FC = () => {
  const { students } = useSelector((state: RootState) => state.poll);
  const { emit } = useWebSocket();

  const handleRemoveStudent = (studentName: string) => {
    emit('removeStudent', { studentName });
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center text-lg font-semibold">
          <Users className="w-5 h-5 mr-2 text-blue-600" />
          Students ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No students joined yet</p>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {student.hasAnswered ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <span className="text-gray-800 font-medium">{student.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={student.hasAnswered ? "default" : "secondary"} 
                         className={student.hasAnswered ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600"}>
                    {student.hasAnswered ? "Answered" : "Waiting"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveStudent(student.name)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentList;
