// src/components/InstructorRoute.jsx
import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

const InstructorRoute = ({ children }) => {
    const { ROLES } = useAuth();

    return (
        <ProtectedRoute requiredRole={ROLES.INSTRUCTOR}>
            {children}
        </ProtectedRoute>
    );
};

export default InstructorRoute;