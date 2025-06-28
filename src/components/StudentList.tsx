
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
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Students ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No students joined yet</p>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {student.hasAnswered ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <span className="text-white font-medium">{student.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={student.hasAnswered ? "default" : "secondary"}>
                    {student.hasAnswered ? "Answered" : "Waiting"}
                  </Badge>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveStudent(student.name)}
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
