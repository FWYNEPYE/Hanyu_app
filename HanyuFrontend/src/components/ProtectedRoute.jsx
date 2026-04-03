// có token mới cho vào trang dashboard
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Lấy token từ localStorage ra kiểm tra
  const token = localStorage.getItem("token");

  // Nếu không có token ->  quay về trang chủ 
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Nếu có token -> Cho vào
  return <Outlet />;
};

export default ProtectedRoute;