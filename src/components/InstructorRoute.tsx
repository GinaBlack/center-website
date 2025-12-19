
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface InstructorRouteProps {
  children: React.ReactNode;
}

const InstructorRoute: React.FC<InstructorRouteProps> = ({ children }) => {
  const { currentUser, isInstructor, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!isInstructor) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default InstructorRoute;