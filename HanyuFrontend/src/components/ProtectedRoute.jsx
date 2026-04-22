import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); 

  if (!token) return <Navigate to="/login" replace />;

  if (allowRoles && !allowRoles.includes(role)) {
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;