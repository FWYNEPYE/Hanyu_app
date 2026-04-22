import React from 'react';
import { HiOutlineBell } from "react-icons/hi";

const Bell = ({ onClick, unreadCount }) => {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="relative p-3 bg-white rounded-2xl border border-gray-100 text-gray-500 hover:text-red-500 transition-all active:scale-90 z-[100]"
    >
      <HiOutlineBell size={26} />
      
      {/* Chỉ hiện dấu đỏ nếu có thông báo chưa đọc (unreadCount > 0) */}
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] text-white font-black flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </span>
      )}
    </button>
  );
};

export default Bell;