import React from 'react';

const ActivityTracker = () => {
  const months = ["Thg 12", "Thg 1", "Thg 2", "Thg 3"];
  const days = ["T2", "T4", "T6"];
  
  // Giả lập dữ liệu: level từ 0 đến 3 (tương ứng với độ đậm nhạt của màu Cam/Đỏ)
  
  const activityData = Array.from({ length: 98 }, () => Math.floor(Math.random() * 4));

  return (
    <div className="bg-white p-6 rounded-[30px] border-2 border-orange-100 shadow-sm w-full font-sans">
      {/* Header của Tracker */}
      <div className="flex justify-between items-center mb-6">
        
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[10px] font-bold">Ít</span>
          {/* Legend: Chú thích màu sắc */}
          <div className="w-3 h-3 rounded-sm bg-gray-100" />
          <div className="w-3 h-3 rounded-sm bg-orange-200" />
          <div className="w-3 h-3 rounded-sm bg-orange-400" />
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-gray-400 text-[10px] font-bold">Nhiều</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {/* Nhãn Thứ bên trái */}
        <div className="flex flex-col justify-between text-[10px] font-bold text-orange-200 py-1 pr-1 border-r border-orange-50">
          {days.map(d => <span key={d}>{d}</span>)}
        </div>
        
        {/* các ô nhỏ */}
        <div className="flex-1 min-w-[300px]">
          {/* Nhãn Tháng */}
          <div className="flex justify-between text-[10px] font-bold text-orange-300 mb-2 px-1 italic">
            {months.map(m => <span key={m}>{m}</span>)}
          </div>
          
          {/* Grid 7 hàng  */}
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {activityData.map((level, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all duration-300 hover:scale-125 cursor-pointer ${
                  level === 0 ? 'bg-gray-100' : 
                  level === 1 ? 'bg-orange-200' : 
                  level === 2 ? 'bg-orange-400' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                }`}
                title={`Mức độ: ${level}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default ActivityTracker;