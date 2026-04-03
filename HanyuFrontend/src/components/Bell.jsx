import React from 'react';
import { HiOutlineBell } from "react-icons/hi";

const Bell = ({ onClick }) => {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation(); // Chặn nổi bọt sự kiện
        onClick();
      }}
      className="relative p-3 bg-white rounded-2xl border border-gray-100 text-gray-500 hover:text-red-500 transition-all active:scale-90 z-[100]"
    >
      <HiOutlineBell size={26} />
      <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
      </span>
    </button>
  );
};

export default Bell;