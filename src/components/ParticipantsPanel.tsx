
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useWebSocket } from '../hooks/useWebSocket';
import { Button } from '@/components/ui/button';

const ParticipantsPanel: React.FC = () => {
  const { students } = useSelector((state: RootState) => state.poll);
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
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-600 font-medium">
              <span>Name</span>
              <span>Action</span>
            </div>
            {students.map((student) => (
              <div key={student.id} className="flex justify-between items-center py-2">
                <span className="text-gray-900">{student.name}</span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleKickOut(student.name)}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  Kick out
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPanel;
