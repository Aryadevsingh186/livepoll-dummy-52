
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import StudentApproval from './StudentApproval';

const ParticipantsPanel: React.FC = () => {
  const { students, pendingStudents } = useSelector((state: RootState) => state.poll);
  const { emit } = useWebSocket();

  const handleKickOut = (studentName: string) => {
    if (window.confirm(`Are you sure you want to kick out ${studentName}?`)) {
      emit('removeStudent', { studentName });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">Participants</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Student Approval Section */}
          {pendingStudents.length > 0 && (
            <div className="mb-6">
              <StudentApproval />
            </div>
          )}

          {/* Approved Students */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
              <span>Name</span>
              <span>Action</span>
            </div>
            {students.map((student) => (
              <div key={student.id} className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900">{student.name}</span>
                  {student.hasAnswered && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Answered
                    </span>
                  )}
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleKickOut(student.name)}
                  className="text-red-600 hover:text-red-800 p-0 h-auto"
                >
                  Kick out
                </Button>
              </div>
            ))}
            {students.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                No approved students yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPanel;
