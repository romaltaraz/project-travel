import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((s: RootState) => s.auth);

  if (!user)              return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/vacations" replace />;
  return <>{children}</>;
};

export default AdminRoute;
