import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoLanguageOutline, IoChatbubbleEllipsesOutline, IoCloudUploadOutline, IoLogoYoutube } from "react-icons/io5";
import { HiChevronLeft } from "react-icons/hi";

const VideoLearning = () => {
  
  const [videos, setVideos] = useState([
    { id: 1, title: "Học tiếng Trung giao tiếp cơ bản", vid: "z6pG_XmD-7U" }
  ]);
  
  // --- UI STATES ---
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAISubsActive, setIsAISubsActive] = useState(false);
  const [activeWord, setActiveWord] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showMean, setShowMean] = useState(true);
  const [addTab, setAddTab] = useState('youtube');

  // --- MOCK DATA (Thay bằng API call sau này) ---
  const vocabGroups = [{ id: 1, name: "HSK 1" }, { id: 2, name: "Chuyên ngành IS" }];
  const subtitles = [{ 
    tokens: [
      { char: "学习", pinyin: "xuéxí", mean: "Học tập", type: "V" },
      { char: "汉语", pinyin: "hànyǔ", mean: "Tiếng Trung", type: "N" }
    ],
    pinyin: "Xuéxí hànyǔ", vi: "Học tiếng Trung"
  }];

  // --- XỬ LÝ BACK TRÊN THIẾT BỊ DI ĐỘNG ---
  const handleBack = useCallback(() => {
    if (selectedVideo) {
      setSelectedVideo(null);
      setIsAISubsActive(false);
    }
  }, [selectedVideo]);

  useEffect(() => {
    if (selectedVideo) {
      window.history.pushState(null, null, window.location.pathname);
      const handlePopState = () => {
        handleBack();
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [selectedVideo, handleBack]);

  // --- CLICK TỪ ---
  const handleWordClick = (e, token) => {
    const rect = e.target.getBoundingClientRect();
    // Điều chỉnh vị trí popover linh hoạt cho cả Mobile và Desktop
    const x = window.innerWidth < 768 ? (window.innerWidth / 2 - 100) : (rect.left + (rect.width / 2) - 100);
    const y = rect.top - 150;
    setPopoverPos({ x, y });
    setActiveWord(token);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* danh sách */}
        {!selectedVideo && (
          <header className="flex justify-between items-center mb-8 md:mb-12">
            <p></p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-2xl text-[10px] md:text-xs font-black shadow-lg shadow-blue-100 transition-all"
            >
              + THÊM VIDEO
            </button>
          </header>
        )}

        {!selectedVideo ? (
          /* GRID DANH SÁCH VIDEO (Responsive 1-2-3 cột) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {videos.map(v => (
              <motion.div 
                layoutId={`video-${v.id}`}
                key={v.id} onClick={() => setSelectedVideo(v)}
                className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 cursor-pointer hover:shadow-xl transition-all group shadow-sm"
              >
                <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase text-[10px]">
                  <img src={`https://img.youtube.com/vi/${v.vid}/maxresdefault.jpg`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="p-6 font-bold text-sm uppercase tracking-tight line-clamp-1">{v.title}</div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* TRANG VIDEO PLAYER */
          <div className="animate-in fade-in slide-in-from-right duration-500">
            
            <div className="mb-4 md:mb-6 flex items-center gap-2">
              <HiChevronLeft  size={32}  className="text-gray-600 cursor-pointer active:scale-90 transition-transform -ml-2"   onClick={handleBack}  />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
              {/* VIDEO CỘT TRÁI */}
              <div className={`${isAISubsActive ? 'lg:col-span-7' : 'lg:col-span-12 w-full max-w-5xl mx-auto'} transition-all duration-700`}>
                <div className="aspect-video bg-black rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white mb-6">
                  <iframe src={`https://www.youtube.com/embed/${selectedVideo.vid}`} className="w-full h-full" allowFullScreen />
                </div>

                {!isAISubsActive && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                
                    <button 
                      onClick={() => setIsAISubsActive(true)}
                      className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl text-xs font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                    >
                      ✨ PHỤ ĐỀ AI
                    </button>
                  </motion.div>
                )}
              </div>

              {/* PHỤ ĐỀ CỘT PHẢI */}
              <AnimatePresence>
                {isAISubsActive && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, lg: { x: 50, y: 0 } }} 
                    animate={{ opacity: 1, y: 0, lg: { x: 0 } }}
                    className="lg:col-span-5 bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 h-[500px] md:h-[600px] flex flex-col shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-5">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">AI Analysis</span>
                      <div className="flex gap-4">
                        <button onClick={() => setShowPinyin(!showPinyin)} className={`text-xl transition-colors ${showPinyin ? 'text-blue-600' : 'text-slate-300'}`}><IoLanguageOutline /></button>
                        <button onClick={() => setShowMean(!showMean)} className={`text-xl transition-colors ${showMean ? 'text-blue-600' : 'text-slate-300'}`}><IoChatbubbleEllipsesOutline /></button>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-8 md:space-y-12 pr-2 custom-scrollbar">
                      {subtitles.map((sub, i) => (
                        <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {sub.tokens.map((t, ti) => (
                              <span key={ti} onClick={(e) => handleWordClick(e, t)} className="text-2xl md:text-3xl font-medium text-slate-800 hover:text-blue-600 cursor-pointer transition-colors leading-relaxed">{t.char}</span>
                            ))}
                          </div>
                          {showPinyin && <p className="text-[10px] md:text-[11px] font-black text-blue-500 mb-1 tracking-tighter uppercase">{sub.pinyin}</p>}
                          {showMean && <p className="text-[11px] md:text-xs text-slate-400 italic font-medium">{sub.vi}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* --- MODAL THÊM VIDEO MỚI --- */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-sm rounded-[2rem] p-6 md:p-10 relative z-[210] shadow-2xl border border-slate-50">
                 <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 text-center border-b pb-4">Nhập video</h2>
                 <div className="flex bg-slate-50 p-1 rounded-xl mb-6">
                    <button onClick={() => setAddTab('youtube')} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${addTab === 'youtube' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><IoLogoYoutube /> YouTube</button>
                    <button onClick={() => setAddTab('local')} className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${addTab === 'local' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><IoCloudUploadOutline /> Local</button>
                 </div>
                 <div className="space-y-4">
                    <input type="text" placeholder="Tiêu đề..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none" 
                    />
                    {addTab === 'youtube' ? (
                      <input  type="text" placeholder="Dán URL Youtube..."   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs outline-none animate-in fade-in slide-in-from-left-2" />
                    ) : (
                      <div className="relative animate-in fade-in slide-in-from-right-2">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <IoCloudUploadOutline className="text-2xl text-slate-400 group-hover:text-blue-500 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase group-hover:text-blue-500">Bấm để tải video</p>
                          </div>
                          <input  type="file"   className="hidden"  accept="video/*" 
                            onChange={(e) => console.log("File đã chọn:", e.target.files[0])} 
                          />
                        </label>
                      </div>
                    )}
                    <button className="w-full bg-blue-600 text-white py-4 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 mt-2 active:scale-95 transition-transform"> THÊM</button>
                  </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- POPOVER TỪ VỰNG --- */}
        <AnimatePresence>
          {activeWord && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setActiveWord(null)}></div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="fixed z-[110] w-[200px] bg-red-500/10 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-red-200/20"
                style={{ left: popoverPos.x, top: popoverPos.y }}
              >
                <div className="flex justify-between items-center mb-1 text-red-950">
                   <span className="text-2xl font-bold">{activeWord.char}</span>
                   <span className="text-[8px] font-black bg-red-600/80 text-white px-2 py-0.5 rounded uppercase">{activeWord.type}</span>
                </div>
                <p className="text-[10px] font-bold text-red-800 uppercase mb-2 leading-none">{activeWord.pinyin}</p>
                <p className="text-[11px] text-red-900 mb-4 font-medium italic italic leading-tight">"{activeWord.mean}"</p>
                <button 
                  onClick={() => { setIsVocabModalOpen(true); setActiveWord(null); }}
                  className="w-full bg-red-600 text-white py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-700 transition-all"
                >
                  +Lưu lại từ này
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- MODAL LƯU TỪ VỰNG --- */}
        <AnimatePresence>
          {isVocabModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div onClick={() => setIsVocabModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative z-[210] shadow-2xl">
                 <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-6 border-b pb-4 text-center italic">Bộ từ</h2>
                 <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {vocabGroups.map(g => (
                      <button key={g.id} className="w-full text-left px-5 py-3 rounded-xl border border-slate-50 hover:bg-blue-50 text-xs font-bold text-slate-600 transition-all">
                        {g.name}
                      </button>
                    ))}
                 </div>
                 <div className="pt-4 border-t border-slate-50 flex gap-2">
                    <input type="text" placeholder="Bộ mới..." className="flex-1 bg-slate-50 border rounded-xl px-4 py-2 text-xs outline-none font-bold" />
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black">LƯU</button>
                 </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default VideoLearning;