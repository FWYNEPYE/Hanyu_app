import React, { useState, useEffect, useRef } from 'react';
import HanziWriter from 'hanzi-writer';
import { HiOutlineRefresh } from "react-icons/hi";

const HanziStroke = ({ text }) => {
  // Tách chữ và lọc bỏ khoảng trắng
  const characters = text ? text.split('').filter(c => c.trim() !== '') : [];
  const [selectedChar, setSelectedChar] = useState('');
  const targetRef = useRef(null);
  const writerRef = useRef(null); 

  // Reset về chữ đầu tiên khi đổi từ search
  useEffect(() => {
    if (characters.length > 0) {
      setSelectedChar(characters[0]);
    }
  }, [text]);

  useEffect(() => {
    if (selectedChar && targetRef.current) {
      targetRef.current.innerHTML = ''; 
      const writer = HanziWriter.create(targetRef.current, selectedChar, {
        width: 160,
        height: 160,
        padding: 5,
        strokeColor: '#ef4444',
        delayBetweenStrokes: 150,
        showOutline: true
      });
      
      writerRef.current = writer; 
      writer.animateCharacter();
    }
  }, [selectedChar]);

  // Hàm xử lý xem lại
  const handleReplay = (e) => {
    if (e) e.stopPropagation(); 
    if (writerRef.current) {
      writerRef.current.animateCharacter();
    }
  };

  if (characters.length === 0) return null;

  return (
    <div className="flex flex-col items-center w-full">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* 1. Hàng chọn chữ - Fix lỗi mất chữ trên PC bằng cách dùng margin-auto cho child */}
      <div className="w-full overflow-x-auto no-scrollbar py-2 mb-6">
        <div className="flex gap-3 px-4 min-w-max mx-auto justify-center">
          {characters.map((char, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedChar(char)}
              className={`flex-shrink-0 w-11 h-11 rounded-xl font-bold transition-all duration-200 border-2 flex items-center justify-center ${
                selectedChar === char 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110 z-10' 
                  : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
              }`}
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Khung vẽ chữ */}
      <div className="relative p-4 bg-white rounded-2xl shadow-inner border border-gray-100">
        {/* Bấm vào chữ cũng replay */}
        <div ref={targetRef} className="cursor-pointer" onClick={handleReplay}></div>
        
        {/* Nút Xem lại*/}
        <button 
          type="button"
          onClick={handleReplay}
          className="absolute -top-2 -right-2 w-10 h-10 bg-white hover:bg-gray-50 rounded-full text-gray-400 hover:text-blue-600 transition-all z-[99] shadow-md border border-gray-100 flex items-center justify-center cursor-pointer"
        >
          <HiOutlineRefresh size={20} />
        </button>
      </div>
    </div>
  );
};

export default HanziStroke;