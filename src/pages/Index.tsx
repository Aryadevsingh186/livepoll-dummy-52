
import React from 'react';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import { store, RootState } from '../store';
import RoleSelector from '../components/RoleSelector';
import TeacherDashboard from '../components/TeacherDashboard';
import StudentInterface from '../components/StudentInterface';

const AppContent: React.FC = () => {
  const { role } = useSelector((state: RootState) => state.poll);

  if (!role) {
    return <RoleSelector />;
  }

  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  return <StudentInterface />;
};

const Index: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default Index;
