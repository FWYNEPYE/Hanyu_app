import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Bell from '../components/Bell';

const MainLayout = () => {
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  return (
    <div>
      {/* Truyền onClick vào Component Bell */}
      <Bell onClick={() => setIsNotiOpen(true)} />

      {/* Noteee: Phải có thuộc tính context  */}
      <Outlet context={{ isNotiOpen, setIsNotiOpen }} />
    </div>
  );
};