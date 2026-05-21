import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  HiOutlineLightningBolt, HiOutlineSearch, 
  HiOutlineClock, HiOutlineBadgeCheck, HiChevronLeft
} from "react-icons/hi";

import FlashcardMode from "./FlashcardMode";

export default function SRSGame({ onBack }) { 
  const [vocabData, setVocabData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStep, setFilterStep] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0]; 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`http://localhost:5252/api/UserProgress/srs-list`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Dữ liệu SRS từ Backend:", response.data); 
    setVocabData(response.data);
  } catch (error) {
    console.error("Lỗi fetch SRS:", error);
  } finally {
    setLoading(false);
  }
};



const [activeRoadmap, setActiveRoadmap] = useState("all");
const [isRoadmapOpen, setIsRoadmapOpen] = useState(false); 

// Tự động gom nhóm danh sách các lộ trình đang học
const availableRoadmaps = Array.from(
  new Map(
    vocabData
      .filter(v => v.roadmapId && v.roadmapId !== "unknown")
      .map(v => [v.roadmapId, { id: v.roadmapId, name: v.roadmapName || "Lộ trình" }])
  ).values()
);



  const getStatus = (date) => {
    if (!date) return { label: "Mới", color: "bg-blue-100 text-blue-600", icon: HiOutlineBadgeCheck };
    const formattedDate = date.split('T')[0];
    if (formattedDate < today) return { label: "Quá hạn", color: "bg-red-100 text-red-600", icon: HiOutlineClock };
    if (formattedDate === today) return { label: "Đến hạn", color: "bg-orange-100 text-orange-600", icon: HiOutlineLightningBolt };
    return { label: "Đang nhớ", color: "bg-emerald-100 text-emerald-600", icon: HiOutlineBadgeCheck };
  };

  // Tạo mảng 9 cấp độ dựa trên dữ liệu thật
const srsLevels = [1, 2, 3, 4, 5, 6, 7, 8].map(levelNum => {
  // Lọc và đếm số từ vựng đang nằm ở cấp độ nhớ này
  const count = vocabData.filter(v => {
    const currentLvl = v.level || v.Level;
    return Number(currentLvl) === levelNum;
  }).length;

  return { level: levelNum, count: count };
});



const filteredData = vocabData.filter(v => {
  // 1. Lọc theo cấp độ nhớ (Level)
  const currentLevel = v.level || v.Level;
  const matchesLevel = filterStep === "all" || Number(currentLevel) === Number(filterStep);
  
  // 2. Lọc theo lộ trình đang chọn
  const currentRoadmapId = v.roadmapId || v.RoadmapId;
  const matchesRoadmap = activeRoadmap === "all" || currentRoadmapId === activeRoadmap;
  
  // 3. Lọc theo ô tìm kiếm
  const vWord = v.word || v.Word || "";
  const vMeaning = v.meaning || v.Meaning || "";
  const matchesSearch = vWord.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        vMeaning.toLowerCase().includes(searchTerm.toLowerCase());
                        
  return matchesLevel && matchesRoadmap && matchesSearch;
});


  // Đếm số từ đến hạn hoặc quá hạn
  const dueCount = vocabData.filter(v => v.next && v.next.split('T')[0] <= today).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Đang đồng bộ SRS...</div>;

  if (isPracticeMode) {
    return (
      
      <FlashcardMode 
        vocabList={vocabData.filter(v => v.next && v.next.split('T')[0] <= today)}
        onFinish={() => {           
          setIsPracticeMode(false); 
          fetchData(); 
        }} 
      />
    );
  }

  return (
    <div className="relative min-h-screen pb-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 pt-16 space-y-6 md:space-y-8">
        <button 
          onClick={onBack} 
          className="absolute left-4 top-4 z-[10] text-gray-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-full shadow-lg bg-white border border-slate-100"
        >
          <HiChevronLeft size={32} />
        </button>

        {/* 📊 Dashboard Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl" />
            <div className="flex justify-between items-center mb-6 relative z-10">
      <h2 className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
        Thống kê độ nhớ từ vựng (SRS)
      </h2>
      <button 
        onClick={() => dueCount > 0 && setIsPracticeMode(true)}
        className="md:hidden flex items-center gap-2 bg-[#FF3B30] px-3 py-1.5 rounded-full shadow-lg active:scale-95 transition-all"
      >
        <span className="text-[10px] font-black text-white uppercase">Ôn tập</span>
        <span className="bg-white text-[#FF3B30] text-[10px] font-black px-1.5 rounded-md">{dueCount}</span>
      </button>
    </div>

           <div className="flex items-end justify-between h-32 md:h-36 px-2 md:px-6 relative z-10 border-b border-slate-100/50">
      {srsLevels.map((item, index) => {
        // Tự động tính toán chiều cao cột dựa trên số từ
        const calculatedHeight = item.count > 0 ? (item.count * 5) + 10 : 2; 
        const finalHeight = Math.min(calculatedHeight, 120);

        const barStyles = [
          "from-rose-400 to-rose-500", "from-orange-400 to-orange-500", 
          "from-amber-400 to-amber-500", "from-emerald-400 to-emerald-500", 
          "from-teal-400 to-teal-500", "from-cyan-400 to-cyan-500", 
          "from-sky-400 to-sky-500", "from-indigo-400 to-indigo-500", 
          "from-purple-400 to-purple-500"
        ];

        return (
          <div key={item.level} className="flex flex-col items-center group/bar flex-1 h-full justify-end relative">
            <div className="relative w-full flex flex-col items-center">
              
              {/* SỐ TỪ TRÊN ĐẦU CỘT */}
              {item.count > 0 && (
                <span 
                  className="absolute text-[10px] font-black text-slate-700 bg-white border border-slate-100 px-1.5 py-0.5 rounded shadow-sm z-20"
                  style={{ bottom: `${finalHeight + 4}px` }}
                >
                  {item.count}
                </span>
              )}

              {/* CỘT BIỂU ĐỒ */}
              <div 
                className={`w-6 md:w-10 rounded-t-md transition-all duration-500 bg-gradient-to-t ${barStyles[index % barStyles.length]} relative shadow-sm group-hover/bar:brightness-110`}
                style={{ 
                  height: `${finalHeight}px`, 
                  minHeight: '7px'
                }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-t-xl"></div>
              </div>
            </div>
            
            {/* NHÃN HIỂN THỊ CẤP ĐỘ NHỚ */}
            <span className="mt-1 text-[9px] font-black text-slate-400 uppercase">Cấp {item.level}</span>
          </div>
    );
  })}
</div>
          </div>

          {/* Action Card PC */}
          <div 
            onClick={() => dueCount > 0 && setIsPracticeMode(true)}
            className={`hidden md:flex relative w-full h-full rounded-[38px] flex-col items-center justify-center cursor-pointer group overflow-hidden shadow-lg transition-all duration-300 ${dueCount > 0 ? 'bg-[#FF3B30] hover:scale-[1.02] active:scale-95 shadow-red-500/20' : 'bg-slate-300 cursor-not-allowed'}`}
          >
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-1">Cần ôn tập ngay</span>
              <h1 className="text-4xl font-black text-white leading-none">{dueCount}</h1>
              <h2 className="text-[11px] font-black text-white uppercase tracking-widest mt-2">Từ vựng</h2>
            </div>
          </div>
        </div>

       {/* 🎯 Filter & Search */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  <div className="flex flex-wrap items-center gap-3">
    
    {/* 1. DROPDOWN LỌC THEO LỘ TRÌNH ĐANG HỌC */}
    <div className="relative min-w-[180px]">
      <button 
        onClick={() => { setIsRoadmapOpen(!isRoadmapOpen); setIsOpen(false); }}
        className="w-full flex items-center justify-between bg-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all active:bg-slate-50"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 truncate max-w-[130px]">
          {activeRoadmap === "all" 
            ? "Tất cả lộ trình" 
            : availableRoadmaps.find(r => r.id === activeRoadmap)?.name || "Lộ trình"}
        </span>
        <HiChevronLeft className={`transition-transform duration-200 text-slate-400 ${isRoadmapOpen ? "-rotate-90" : "-rotate-180"}`} size={16} />
      </button>

      {isRoadmapOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsRoadmapOpen(false)}></div>
          <div className="absolute top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            <button
              onClick={() => { setActiveRoadmap("all"); setIsRoadmapOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors flex justify-between items-center ${activeRoadmap === "all" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <span>Tất cả lộ trình</span>
              <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-black">{vocabData.length}</span>
            </button>

            <div className="h-[1px] bg-slate-100 mx-2"></div>

            <div className="max-h-[220px] overflow-y-auto">
              {availableRoadmaps.map(rm => {
                const countInRoadmap = vocabData.filter(v => (v.roadmapId || v.RoadmapId) === rm.id).length;
                return (
                  <button
                    key={rm.id}
                    onClick={() => { setActiveRoadmap(rm.id); setIsRoadmapOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors flex justify-between items-center ${activeRoadmap === rm.id ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    <span className="truncate max-w-[110px]">{rm.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${activeRoadmap === rm.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {countInRoadmap}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>

    {/* 2. DROPDOWN LỌC THEO CẤP ĐỘ NHỚ  */}
    <div className="relative min-w-[180px]">
      <button 
        onClick={() => { setIsOpen(!isOpen); setIsRoadmapOpen(false); }}
        className="w-full flex items-center justify-between bg-white border border-slate-200 px-4 py-2.5 rounded-xl transition-all active:bg-slate-50"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
          {filterStep === "all" ? "Tất cả cấp độ" : `Cấp độ nhớ ${filterStep}`}
        </span>
        <HiChevronLeft className={`transition-transform duration-200 text-slate-400 ${isOpen ? "-rotate-90" : "-rotate-180"}`} size={16} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
            <button
              onClick={() => { setFilterStep("all"); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${filterStep === "all" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Tất cả cấp độ
            </button>

            <div className="h-[1px] bg-slate-100 mx-2"></div>

            <div className="max-h-[220px] overflow-y-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <button
                  key={s}
                  onClick={() => { setFilterStep(s); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${filterStep === s ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}`}
                >
                  Cấp độ nhớ {s}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>

  </div>

  {/* Ô Tìm kiếm bên phải */}
  <div className="relative flex-1 md:max-w-xs">
    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
    <input 
      type="text" 
      placeholder="Tìm kiếm từ..." 
      value={searchTerm} 
      onChange={(e) => setSearchTerm(e.target.value)} 
      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-100 rounded-full text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-red-500/10" 
    />
  </div>
</div>

        {/* 📚 Word List */}
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm flex flex-col max-h-[500px]">
          <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-slate-50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b">
            <div className="col-span-4">Từ vựng</div>
            <div className="col-span-3">Ý nghĩa</div>
            <div className="col-span-2 text-center">Cấp độ</div>
            <div className="col-span-3 text-right">Trạng thái</div>
          </div>

          <div className="divide-y divide-slate-50 overflow-y-auto">
            {filteredData.length > 0 ? filteredData.map((v, i) => {
              const status = getStatus(v.next);
              return (
                <div key={i} className="flex md:grid md:grid-cols-12 items-center justify-between px-4 py-4 md:px-8 md:py-5 hover:bg-slate-50/50 transition-all cursor-pointer group">
                  <div className="col-span-3 md:col-span-4 flex flex-col md:flex-row md:items-baseline md:gap-2 min-w-0">
                    <h3 className="text-sm md:text-xl font-black text-slate-800 truncate">{v.word}</h3>
                    <p className="text-[8px] md:text-[11px] text-slate-400 font-medium truncate lowercase">/{v.pinyin}/</p>
                  </div>
                  <div className="col-span-5 md:col-span-3 min-w-0 px-2">
                    <p className="text-[11px] md:text-sm font-bold text-slate-600 truncate">{v.meaning}</p>
                  </div>
                 <div className="hidden md:block md:col-span-2 text-center">
                    <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500">
                      Lv {String(v.level || v.Level || "1")}
                    </span>
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <div className={`flex items-center gap-2 px-3 py-1.5 md:px-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider ${status.color}`}>
                      <status.icon size={12} className="hidden md:block" />
                      {status.label}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest">Không có dữ liệu phù hợp</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}