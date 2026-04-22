import React from 'react';

const ActivityTracker = ({ data = [] }) => {
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  
  const getDynamicMonths = () => {
    const today = new Date();
    const m = today.getMonth();
    const y = today.getFullYear();
    return [
      { month: (m - 1 + 12) % 12, year: m === 0 ? y - 1 : y },
      { month: m, year: y },
      { month: (m + 1) % 12, year: m === 11 ? y + 1 : y },
    ];
  };

 const generateCombinedData = () => {
    const months = getDynamicMonths();
    let combinedGrid = [];
    let monthInfo = [];
    
    const now = new Date();
    const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];

    
    const dataMap = {};
    const dataStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    dataStartDate.setDate(dataStartDate.getDate() - 97); // Mốc startDate 

    data.forEach((mins, index) => {
      const d = new Date(dataStartDate);
      d.setDate(d.getDate() + index);
      const dateKey = d.toISOString().split('T')[0];
      dataMap[dateKey] = mins;
    });

    months.forEach((m, idx) => {
      const firstDayOfMonth = new Date(m.year, m.month, 1).getDay();
      const emptySlots = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
      const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
      
      const startIdxInGrid = combinedGrid.length;
      
      if (idx === 0) {
        for (let i = 0; i < emptySlots; i++) {
          combinedGrid.push({ minutes: -1, label: "" });
        }
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const currentDateObj = new Date(m.year, m.month, d);
        const dateKey = currentDateObj.toISOString().split('T')[0];
        
        let minutes = dataMap[dateKey] || 0;

        // Chặn không cho hiện data ảo 
        if (dateKey > todayStr) {
          minutes = 0;
        }

        const dayLabel = daysOfWeek[currentDateObj.getDay() === 0 ? 6 : currentDateObj.getDay() - 1];
        combinedGrid.push({
          minutes: minutes,
          label: `${dayLabel}, ${d} thg ${m.month + 1}`
        });
      }

      const endIdxInGrid = combinedGrid.length;
      const numCols = Math.ceil((endIdxInGrid - startIdxInGrid) / 7);
      monthInfo.push({ label: `Thg ${m.month + 1}`, cols: numCols });
    });

    return { combinedGrid, monthInfo };
  };
  const { combinedGrid, monthInfo } = generateCombinedData();

  const getLevel = (minutes) => {
    if (minutes < 0) return -1;
    if (minutes === 0) return 0;
    if (minutes < 10) return 1;
    if (minutes < 20) return 2;
    return 3;
  };

  return (
    <div className="bg-white p-6 rounded-[30px] border-2 border-orange-100 shadow-sm w-fit font-sans">
      {/* Legend */}
      <div className="flex items-center gap-1 mb-6 ml-4">
        <span className="text-gray-400 text-[10px] font-bold">Ít</span>
        {[0, 1, 2, 3].map(lvl => (
          <div key={lvl} className={`w-3.5 h-3.5 rounded-sm ${
            lvl === 0 ? 'bg-gray-100' : lvl === 1 ? 'bg-orange-200' : lvl === 2 ? 'bg-orange-400' : 'bg-red-500'
          }`} />
        ))}
        <span className="text-gray-400 text-[10px] font-bold mr-4">Nhiều</span>
      </div>

      <div className="flex gap-4">
        {/* HÀNG DỌC */}
        <div className="flex flex-col justify-between text-[11px] font-black text-orange-400 py-1 h-[130px] mt-6 ">
          <span>T2</span>
          <span className="opacity-0">T3</span>
          <span>T4</span>
          <span className="opacity-0">T5</span>
          <span>T6</span>
          <span className="opacity-0">T7</span>
          <span >CN</span>
        </div>


        {/* tháng */}
        <div className="flex flex-col border-l border-orange-200/30 pl-3">
          <div className="flex gap-1 mb-2">
            {monthInfo.map((m, i) => (
              <div 
                key={i} 
                className="text-[12px] font-black text-orange-500 px-4 tracking-wider"
                style={{ flex: `0 0 ${m.cols * 18}px` }} 
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* GRID liền mạch */}
          <div className="grid grid-flow-col grid-rows-7 gap-1">
            {combinedGrid.map((item, i) => {
              const level = getLevel(item.minutes);
              if (level === -1) return <div key={i} className="w-3.5 h-3.5 bg-transparent" />;

              return (
                <div key={i} className="group relative">
                  <div className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-300 hover:scale-125 cursor-pointer ${
                    level === 0 ? 'bg-gray-100' : 
                    level === 1 ? 'bg-orange-200' : 
                    level === 2 ? 'bg-orange-400' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.2)]'
                  }`} />

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                    <div className="bg-[#1f2937] text-white text-[10px] py-1.5 px-3 rounded-lg whitespace-nowrap shadow-xl relative">
                      {item.label}: <span className="text-orange-300 font-bold">{item.minutes} phút học</span>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#1f2937]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;