import React, { useState, useEffect } from 'react';
import { 
  HiOutlineSearch, HiOutlineChevronUp, HiOutlineHeart, 
  HiOutlineDuplicate, HiOutlineBookOpen, HiOutlineAcademicCap, 
  HiOutlineTranslate, HiOutlineFilter, HiOutlineVolumeUp, 
  HiOutlineFire, HiOutlineX 
} from "react-icons/hi";
import { motion, AnimatePresence } from 'framer-motion';

const CommunityPage = () => {
  // 1. STATES
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeSort, setActiveSort] = useState('Mới nhất');
  const [showButton, setShowButton] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  // 2. DỮ LIỆU MẪU (Thêm trường points để hiển thị trong modal)
  const allDecks = [
    { id: 1, title: "100 Câu thả thính", description: "Cưa đổ crush chỉ trong 1 nốt nhạc bằng tiếng Trung", author: "Linh Linh", words: 100, level: "HSK 3", tags: ["Thả thính", "Giao tiếp"], likes: 850, points: 50, icon: <HiOutlineHeart className="w-8 h-8 md:w-12 md:h-12" />, color: "bg-rose-50 text-rose-400" },
    { id: 2, title: "Tiếng Trung IT", description: "Từ vựng chuyên ngành cho lập trình viên", author: "Minh Dev", words: 250, level: "HSK 5", tags: ["IT", "Công việc"], likes: 2100, points: 120, icon: <HiOutlineAcademicCap className="w-8 h-8 md:w-12 md:h-12" />, color: "bg-sky-50 text-sky-400" },
    { id: 3, title: "Từ vựng Trà Sữa", description: "Menu các loại trà sữa hot nhất hiện nay", author: "Funfun", words: 50, level: "HSK 2", tags: ["Đồ uống", "Đời sống"], likes: 420, points: 30, icon: <HiOutlineBookOpen className="w-8 h-8 md:w-12 md:h-12" />, color: "bg-amber-50 text-amber-400" },
    { id: 4, title: "Ngữ pháp HSK 4", description: "Tổng hợp các cấu trúc ngữ pháp hay gặp", author: "Hanyu Admin", words: 120, level: "HSK 4", tags: ["HSK", "Ngữ pháp"], likes: 950, points: 80, icon: <HiOutlineTranslate className="w-8 h-8 md:w-12 md:h-12" />, color: "bg-emerald-50 text-emerald-400" },
  ];

  const previewWords = [
    { hanzi: "安静", pinyin: "ānjìng", type: "TÍNH TỪ", mean: "yên tĩnh", example: "请安静，图书馆里不能说话。", note: "Dùng cho không gian." },
    { hanzi: "电梯", pinyin: "diàntī", type: "DANH TỪ", mean: "thang máy", example: "我们在电梯门口等他。", note: "Khác với 楼梯." },
    { hanzi: "层", pinyin: "céng", type: "LƯỢNG TỪ", mean: "tầng", example: "我家住在五层。", note: "Lượng từ tòa nhà." },
  ];

  // 3. LOGIC LỌC
  const filteredDecks = allDecks.filter(deck => {
    const matchesSearch = deck.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          deck.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'Tất cả' || deck.level.includes(activeTab) || deck.tags.includes(activeTab);
    return matchesSearch && matchesTab;
  }).sort((a, b) => (activeSort === 'Thịnh hành' ? b.likes - a.likes : b.id - a.id));

  useEffect(() => {
    const handleWinScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener('scroll', handleWinScroll);
    return () => window.removeEventListener('scroll', handleWinScroll);
  }, []);

  const tabs = ['Tất cả', 'Thịnh hành', 'HSK 1-3', 'HSK 4-6', 'Giao tiếp', 'IT', 'Du lịch'];

  return (
    <div className="min-h-screen pb-20 px-3 md:px-10 bg-[#FAFBFF]">
      
      {/* HEADER */}
      <div className="pt-8 md:pt-12 pb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-[1000] tracking-tighter text-slate-800 uppercase ">
            Cộng đồng <span className="text-rose-500">Hanyu</span>
          </h2>
        </div>
        <div className="relative group w-full md:w-80">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-colors" size={18} />
          <input 
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bộ từ hoặc tác giả..." 
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-rose-100 transition-all"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {tabs.map((tab) => (
          <button
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100 hover:border-rose-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SORT */}
      <div className="flex items-center gap-4 mb-8">
        <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase"><HiOutlineFilter /> Sắp xếp:</span>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['Mới nhất', 'Thịnh hành'].map(sort => (
            <button
              key={sort} onClick={() => setActiveSort(sort)}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                activeSort === sort ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {sort}
            </button>
          ))}
        </div>
      </div>

      {/* GRID CARD */}
     <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
  <AnimatePresence mode='popLayout'>
    {filteredDecks.map((deck) => (
      <motion.div 
        layout key={deck.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -8 }}
        className="bg-white rounded-[30px] md:rounded-[40px] overflow-hidden shadow-sm border border-slate-50 flex flex-col cursor-pointer group"
        onClick={() => setSelectedDeck(deck)}
      >
        {/* User Header */}
        <div className="p-3 md:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${deck.author}`} className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-slate-100" alt="avt" />
            <span className="text-[9px] md:text-[10px] font-black text-slate-800 uppercase italic truncate max-w-[50px] md:max-w-none">{deck.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
    <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
      <HiOutlineBookOpen size={10} className="text-slate-500" />
      <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase">
        {deck.words} từ
      </span>
    </div>
    <span className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-tighter shadow-sm">
      {deck.level}
    </span>
  </div>
        </div>

        {/* Thumbnail + Point Badge */}
        <div className="px-3 md:px-5 relative">
          {/* TAG POINT NỔI BẬT Ở GÓC */}
          <div className="absolute top-2 right-5 md:right-7 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-rose-500 px-2.5 py-1 rounded-xl border border-rose-100 shadow-sm transition-transform group-hover:scale-110">
            <HiOutlineFire size={12} className="animate-pulse" />
            <span className="text-[10px] font-[1000]">{deck.points}P</span>
          </div>

          <div className={`relative h-28 md:h-44 rounded-[22px] md:rounded-[30px] flex items-center justify-center ${deck.color} shadow-inner`}>
            {deck.icon}
            <div className="absolute bottom-2 flex gap-1">
              {deck.tags.map(tag => (
                <span key={tag} className="bg-white/80 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase text-slate-600">#{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex-1 flex flex-col">
          <h3 className="text-slate-800 text-[11px] md:text-lg font-[1000] uppercase italic line-clamp-2 leading-tight">
            {deck.title}
          </h3>
          <p className="text-[9px] md:text-[11px] text-slate-400 font-bold mt-1 line-clamp-2 italic">
            "{deck.description}"
          </p>
          
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
            <div className="flex items-center gap-1">
              <HiOutlineHeart className="text-rose-500" size={16} />
              <span className="text-[9px] font-black text-slate-400">{deck.likes.toLocaleString()}</span>
            </div>
            
            <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-md active:scale-95">
              <HiOutlineDuplicate size={14} />
              LƯU 
            </button>
          </div>
        </div>
      </motion.div>
    ))}
  </AnimatePresence>
</div>

      {/* MODAL NHỎ GỌN NHƯ SẾP YÊU CẦU */}
      <AnimatePresence>
        {selectedDeck && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-6xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* HEADER MODAL */}
              <div className="p-6 sm:p-8 border-b border-slate-50 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDeck.author}`} className="w-10 h-10 rounded-xl bg-slate-100" alt="avt" />
                    <span className="text-[10px] font-black text-slate-800 uppercase italic tracking-widest">{selectedDeck.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-rose-50 text-rose-500 px-3 py-1.5 rounded-full border border-rose-100">
                    <HiOutlineFire size={14} />
                    <span className="text-xs font-[1000]">{selectedDeck.points}P</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-[1000] text-slate-800 uppercase italic tracking-tighter">Bộ: {selectedDeck.title}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">{selectedDeck.level}</span>
                      {selectedDeck.tags.map(t => (
                        <span key={t} className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">#{t}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setSelectedDeck(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all"><HiOutlineX size={20}/></button>
                </div>
              </div>

              {/* TABLE CONTENT */}
              <div className="flex-1 overflow-auto p-4 sm:p-8 no-scrollbar bg-white">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-4"></th>
                      <th className="px-4 pb-2">Hán tự</th>
                      <th className="px-4 pb-2">Pinyin</th>
                      <th className="px-4 pb-2 hidden md:table-cell">Loại</th>
                      <th className="px-4 pb-2">Nghĩa</th>
                      <th className="px-4 pb-2 hidden lg:table-cell">Ví dụ</th>
                      <th className="px-4 pb-2 hidden xl:table-cell">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewWords.map((item, idx) => (
                      <tr key={idx} className="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                        <td className="px-4 py-4 rounded-l-[20px] w-12 text-center">
                          <button className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                            <HiOutlineVolumeUp size={18} />
                          </button>
                        </td>
                        <td className="px-4 py-4 font-black text-xl text-slate-800">{item.hanzi}</td>
                        <td className="px-4 py-4 font-bold text-rose-500 italic text-sm">[{item.pinyin}]</td>
                        <td className="px-4 py-4 hidden md:table-cell"><span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-black uppercase text-slate-400">{item.type}</span></td>
                        <td className="px-4 py-4 font-bold text-slate-700 text-sm uppercase italic">{item.mean}</td>
                        <td className="px-4 py-4 hidden lg:table-cell text-[11px] text-slate-500 italic max-w-xs truncate">{item.example}</td>
                        <td className="px-4 py-4 hidden xl:table-cell rounded-r-[20px] text-[11px] text-slate-400">{item.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-center py-6 opacity-40 italic font-black text-slate-400 uppercase tracking-widest text-[9px]">
                  Cần đổi điểm để mở khóa toàn bộ {selectedDeck.words} từ vựng
                </p>
              </div>

              {/* FOOTER ACTION */}
              <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-between shrink-0">
                <button onClick={() => setSelectedDeck(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hủy bỏ</button>
                <button className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-[20px] text-[11px] font-[1000] uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg">
                  <HiOutlineDuplicate size={16} /> ĐỔI {selectedDeck.points} POINT & LƯU
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BACK TO TOP */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-10 right-6 z-[110] w-12 h-12 bg-white text-rose-500 rounded-full shadow-2xl border border-rose-100 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all group"
          >
            <HiOutlineChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityPage;



     {sortedDecks.map((deck) => {
            const isLiked = JSON.parse(localStorage.getItem('likedDecks') || '[]').includes(deck.id);
          
          
          
            <motion.div 
              layout key={deck.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }} onClick={() => handleOpenPreview(deck)}
              className="bg-white rounded-[30px] md:rounded-[40px] overflow-hidden shadow-sm border border-slate-50 flex flex-col cursor-pointer group"
            >
                <div className="p-3 md:p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img 
                src={deck.authorAvatar || `https://ui-avatars.com/api/?name=${deck.author}&background=random&color=fff`} 
                className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-slate-100 object-cover border border-slate-100 shadow-sm" 
                alt="avatar" 
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = `https://ui-avatars.com/api/?name=${deck.author}&background=random&color=fff`;
                }}
                />
                    <span className="text-[9px] md:text-[10px] font-black text-slate-800 uppercase truncate max-w-[80px]">
                    {deck.author}
                    </span>
                    
                </div>
                
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-tighter shadow-sm">
                    {deck.level}
                </span>
                </div>

                <div className="px-3 md:px-5 relative">
                {/* Badge Point */}
                <div className="absolute top-2 right-5 md:right-7 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-rose-500 px-2.5 py-1 rounded-xl border border-rose-100 shadow-sm">
                    <HiOutlineFire size={12} className="animate-pulse" />
                    <span className="text-[10px] font-[1000]">{deck.points || 0}P</span>
                </div>

                <div className={`relative h-28 md:h-44 rounded-[22px] md:rounded-[30px] flex items-center justify-center ${deck.color || 'bg-slate-100'} overflow-hidden shadow-inner`}>
                    
                    {deck.icon && deck.icon.includes('fa-') ? (
                    <i className={`${deck.icon} text-4xl md:text-6xl text-slate-800/20 group-hover:scale-110 group-hover:text-slate-800/40 transition-all duration-500`}></i>
                    ) : (
                    <span className="text-4xl md:text-6xl transition-transform duration-500 group-hover:scale-110">
                        {deck.icon || '📚'}
                    </span>
                    )}
                    
                    
                <div className="absolute bottom-3 left-0 right-0 flex justify-center px-2">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl text-[8px] md:text-[10px] font-black text-slate-700 border border-white shadow-lg uppercase tracking-tighter">
                    <span className="text-rose-500">{deck.words || 0}</span> TỪ VỰNG
                </span>
                
                </div>
            </div>
</div>

              {/* Content Area */}
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <h3 className="text-slate-800 text-[11px] md:text-lg font-[1000] uppercase  line-clamp-2 leading-tight">
                  {deck.title}
                </h3>
                
                <p className="text-[9px] md:text-[11px] text-slate-400 font-bold mt-1 line-clamp-2 ">
                  "{deck.description}"
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                  <button 
    onClick={(e) => handleLike(e, deck.id)}
    className="flex items-center gap-1.5 group/heart p-1 hover:bg-rose-50 rounded-lg transition-all"
  >
    <HiOutlineHeart 
      className={`transition-all duration-300 ${
        deck.likes > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400 group-hover/heart:text-rose-500'
      }`} 
      size={18} 
    />
    <span className={`text-[10px] font-black transition-colors ${
      deck.likes > 0 ? 'text-rose-500' : 'text-slate-400 group-hover/heart:text-rose-500'
    }`}>
      {(deck.likes || 0).toLocaleString()}
    </span>
  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenPreview(deck); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-md active:scale-95"
                  >
                    <HiOutlineDuplicate size={14} /> LƯU 
                  </button>
                </div>
              </div>
            </motion.div>
          )}}