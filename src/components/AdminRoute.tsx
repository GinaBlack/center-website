// src/components/AdminRoute.jsx
import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
//import {ROLES} from '../constants/roles';

const AdminRoute = ({ children }) => {
  const { ROLES } = useAuth();

  return (
    <ProtectedRoute requiredRole={ROLES.ADMIN}>
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;