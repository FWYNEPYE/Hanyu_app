import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HiOutlineSearch, HiOutlineChevronUp, HiOutlineHeart, 
  HiOutlineDuplicate, HiOutlineFilter, HiOutlineVolumeUp, 
  HiOutlineFire, HiOutlineX 
} from "react-icons/hi";
import { motion, AnimatePresence } from 'framer-motion';

const CommunityPage = () => {
  
  const [decks, setDecks] = useState([]); 
  const [previewWords, setPreviewWords] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [activeSort, setActiveSort] = useState('Mới nhất');
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [ownedDecks, setOwnedDecks] = useState([]); 
  const [myDecks, setMyDecks] = useState([]); 

  const tabs = ['Tất cả', 'Thịnh hành', 'HSK', 'Giao tiếp', 'IT', 'Du lịch'];

  //ds
  useEffect(() => {
    const fetchDecks = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/community/decks', {
          params: { tab: activeTab, search: searchTerm }
        });
        setDecks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi fetch API:", err);
        setDecks([]);
      } finally {
        setLoading(false);
      }
    };fetchDecks();
  }, [activeTab, searchTerm]);



  const handleLike = async (e, deckId) => {
    e.stopPropagation();
    
    const likedDecks = JSON.parse(localStorage.getItem('likedDecks') || '[]');
    const isAlreadyLiked = likedDecks.includes(deckId);

    try {
      const res = await axios.post(`/api/community/like/${deckId}?isUnliking=${isAlreadyLiked}`);
      
      let newLikedDecks;
      if (isAlreadyLiked) {
        newLikedDecks = likedDecks.filter(id => id !== deckId); // Xóa khỏi danh sách
      } else {
        newLikedDecks = [...likedDecks, deckId]; // Thêm vào danh sách
      }
      localStorage.setItem('likedDecks', JSON.stringify(newLikedDecks));

      setDecks(prevDecks => 
        prevDecks.map(d => 
          d.id === deckId ? { ...d, likes: res.data.likes } : d
        )
      );
    } catch (err) {
      console.error("Lỗi hệ thống tim mạch:", err);
    }
  };


//check bộ từ xem tải version nào
const fetchOwnedDecks = async () => {
    const userId = localStorage.getItem('userId');
    try {
        const res = await axios.get(`http://localhost:5252/api/community/owned/${userId}`);
        setOwnedDecks(res.data);
    } catch (err) {
        console.error("Lỗi fetch danh sách đã sở hữu:", err);
    }
};

useEffect(() => {
    fetchOwnedDecks();
}, []);


const fetchMyCollection = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) return;
  
  try {
    // timestamp để tránh bị cache trình duyệt
    const res = await axios.get(`http://localhost:5252/api/category/user/${userId}?t=${Date.now()}`);
    
    console.log("Kho đồ của tôi:", res.data); 
    setMyDecks(res.data); 
  } catch (err) {
    console.error("Lỗi lấy kho đồ:", err);
  }
};


useEffect(() => { 
    fetchMyCollection(); 
}, []);



  //Sắp xếp tại Client 
  const sortedDecks = [...decks].sort((a, b) => 
    activeSort === 'Thịnh hành' ? (b.likes - a.likes) : (b.id - a.id)
  );

  useEffect(() => {
    const handleWinScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener('scroll', handleWinScroll);
    return () => window.removeEventListener('scroll', handleWinScroll);
  }, []);

  const speakHanzi = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };



 const handleOpenPreview = async (deck) => {
  await fetchMyCollection(); 
  // Giữ nguyên deck gốc từ Community (có đủ số lượng words gốc)
  setSelectedDeck(deck); 
  try {
    const res = await axios.get(`/api/community/preview/${deck.id}`);
    if (Array.isArray(res.data)) {
      setPreviewWords(res.data);
      setSelectedDeck(prev => ({
        ...prev,
        vocabularies: res.data 
      }));
    }
  } catch (err) { 
    console.error("Lỗi preview:", err); 
  }
};



const handleRedeem = async () => {
    if (!selectedDeck) return;
    const currentUserId = localStorage.getItem('userId');
    setLoading(true); 
    try {
        // Kiểm tra xem đã sở hữu chưa để gọi API tương ứng
        const myCopy = myDecks.find(m => String(m.parentCategoryID) === String(selectedDeck.id));
        
        let res;
        if (myCopy) {
            res = await axios.post(`http://localhost:5252/api/category/sync/${selectedDeck.id}?userId=${currentUserId}`);
        } else {
            res = await axios.post('http://localhost:5252/api/community/redeem', { 
                deckId: selectedDeck.id.toString(),
                userId: currentUserId 
            });
        }
        localStorage.setItem('userPoints', res.data.newPoints);
        window.dispatchEvent(new Event("updatePoints"));

        alert(res.data.msg || res.data.message);
        await Promise.all([fetchMyCollection(), fetchOwnedDecks()]);
        setSelectedDeck(null); 
    } catch (err) { 
        alert(err.response?.data?.msg || "Lỗi hệ thống"); 
    } finally {
        setLoading(false);
    }
};


const handleSyncCollection = async (categoryId) => {
  const userId = localStorage.getItem('userId');
  setLoading(true);
  try {
    const res = await axios.post(`http://localhost:5252/api/category/sync/${categoryId}?userId=${userId}`);
    
    alert(res.data.message || "Đã đồng bộ!");
    
    // trả về số point mới sau khi dùng
    if (res.data.newPoints !== undefined) {
          localStorage.setItem('userPoints', res.data.newPoints);
          window.dispatchEvent(new Event("updatePoints")); 
        }

        await fetchMyCollection(); 
        setSelectedDeck(null);

  } catch (err) {
      alert("Lỗi đồng bộ: " + (err.response?.data?.message || err.message));
    } finally {
        setLoading(false);
    }
};



return (
    <div className="min-h-screen pb-20 px-3 md:px-10 bg-[#FAFBFF]">
      {/* HEADER */}
      <div className="pt-8 md:pt-12 pb-6 flex flex-col md:flex-row justify-between gap-6">
        <h2 className="text-2xl md:text-4xl font-[1000] tracking-tighter text-slate-800 uppercase">
          Cộng đồng <span className="text-rose-500">Hanyu</span>
        </h2>
        <div className="relative w-full md:w-80">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bộ từ..." 
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none shadow-sm focus:ring-2 focus:ring-rose-100 transition-all"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {tabs.map((tab) => (
          <button
            key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
        {sortedDecks.map((deck) => {
          // Kiểm tra trạng thái đã Like từ localStorage
          const likedDecks = JSON.parse(localStorage.getItem('likedDecks') || '[]');
          const isLiked = likedDecks.includes(deck.id);
          const currentUserId = parseInt(localStorage.getItem('userId'));
          const isMyDeck = deck.authorId === currentUserId;

          const isAlreadyOwned = myDecks.some(m => m.id === deck.id || m.parentCategoryID === deck.id);

          return (
            <motion.div 
              layout key={deck.id} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }} 
              onClick={() => handleOpenPreview(deck)}
              className="bg-white rounded-[30px] md:rounded-[40px] overflow-hidden shadow-sm border border-slate-50 flex flex-col cursor-pointer group"
            >
              <div className="p-3 md:p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src={deck.authorAvatar || `https://ui-avatars.com/api/?name=${deck.author}&background=random&color=fff`} 
                    className="w-7 h-7 md:w-9 md:h-9 rounded-xl bg-slate-100 object-cover border border-slate-100 shadow-sm" 
                    alt="avatar" 
                  />
                  <span className="text-[11px] md:text-[12px] font-black text-slate-800 uppercase truncate max-w-[80px]">
                    {deck.author}
                  </span>
                </div>
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-tighter shadow-sm">
                  {deck.level}
                </span>
              </div>

              <div className="px-3 md:px-5 relative">
                <div className="absolute top-2 right-5 md:right-7 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-rose-500 px-2.5 py-1 rounded-xl border border-rose-100 shadow-sm">
                  {/* <HiOutlineFire size={12} className="animate-pulse" /> */}
                  <span className="text-[12px] font-[1000]">{deck.points || 0} ☀️</span>
                </div>

                <div className={`relative h-28 md:h-44 rounded-[22px] md:rounded-[30px] flex items-center justify-center ${deck.color || 'bg-slate-100'} overflow-hidden shadow-inner`}>
                  {deck.icon && deck.icon.includes('fa-') ? (
                    <i className={`${deck.icon} text-4xl md:text-6xl text-slate-800/20 group-hover:scale-110 transition-all`}></i>
                  ) : (
                    <span className="text-4xl md:text-6xl group-hover:scale-110 transition-all">
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

              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <h3 className="text-slate-800 text-[11px] md:text-lg font-[1000] uppercase line-clamp-2 leading-tight">
                  {deck.title}
                </h3>
                <p className="text-[9px] md:text-[11px] text-slate-400 font-bold mt-1 line-clamp-2">
                  "{deck.description}"
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                  <button 
                    onClick={(e) => handleLike(e, deck.id)}
                    className="flex items-center gap-1.5 group/heart p-1 hover:bg-rose-50 rounded-lg transition-all"
                  >
                  
                    <HiOutlineHeart 
                      className={`transition-all duration-300 ${
                        isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-400 group-hover/heart:text-rose-500'
                      }`} 
                      size={22} 
                    />
                    <span className={`text-[10px] font-black transition-colors ${
                      isLiked ? 'text-rose-500' : 'text-slate-400 group-hover/heart:text-rose-500'
                    }`}>
                      {(deck.likes || 0).toLocaleString()}
                    </span>
                  </button>
                  
                  {isMyDeck || isAlreadyOwned ? (
                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                      ĐÃ LƯU
                    </span>
                    ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenPreview(deck); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all shadow-md active:scale-95"
                    >
                      <HiOutlineDuplicate size={14} /> LƯU 
                    </button>
                  )}  
                </div>
              </div>
            </motion.div>
          ); 
        })}
       </AnimatePresence>
      </div>

      {/* MODAL  */}
      <AnimatePresence>
        {selectedDeck && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-6xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative"
            >
              <div className="p-6 sm:p-8 border-b border-slate-50 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                        src={selectedDeck.authorAvatar || `https://ui-avatars.com/api/?name=${selectedDeck.author}&background=random&color=fff`} 
                        className="w-10 h-10 rounded-xl bg-slate-100 object-cover border border-slate-100 shadow-sm" 
                        alt="avt" 
                        onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = `https://ui-avatars.com/api/?name=${selectedDeck.author}&background=random&color=fff`;
                        }}
                    />
                    <span className="text-[10px] font-black text-slate-800 uppercase  tracking-widest">{selectedDeck.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-rose-50 text-rose-500 px-3 py-1.5 rounded-full border border-rose-100">
                    {/* <HiOutlineFire size={14} /> */}
                    <span className="text-sm font-[1000]">{selectedDeck.points}☀️</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl sm:text-2xl font-[1000] text-slate-800 uppercase  tracking-tighter">Bộ: {selectedDeck.title}</h3>
                      
                      <span className="bg-rose-500 text-white px-2 py-0.5 rounded-lg text-[10px] md:text-[12px] font-black shadow-sm">
                        {selectedDeck.words || previewWords.length} TỪ
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">{selectedDeck.level}</span>
                      {selectedDeck.tags?.map(t => (
                        <span key={t} className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">#{t}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setSelectedDeck(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all"><HiOutlineX size={20}/></button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 sm:p-8 no-scrollbar bg-white">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-4 text-center w-16">Nghe</th>
                      <th className="px-4 pb-2">Hán tự</th>
                      <th className="px-4 pb-2">Pinyin</th>
                      <th className="px-4 pb-2 hidden md:table-cell">Loại</th>
                      <th className="px-4 pb-2">Nghĩa</th>
                      <th className="px-4 py-4 hidden lg:table-cell">Ví dụ</th>
                      <th className="px-4 py-4 hidden xl:table-cell">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewWords.map((item, idx) => (
                      <tr key={idx} className="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                        <td className="px-4 py-4 rounded-l-[20px] text-center w-16">
                          <button onClick={() => speakHanzi(item.hanzi)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                            <HiOutlineVolumeUp size={18} />
                          </button>
                        </td>
                        <td className="px-4 py-4 font-black text-xl text-slate-800">{item.hanzi}</td>
                        <td className="px-4 py-4 font-bold text-rose-500 italic text-sm">[{item.pinyin}]</td>
                        <td className="px-4 py-4 hidden md:table-cell"><span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-black uppercase text-slate-400">{item.type || 'Từ vựng'}</span></td>
                        <td className="px-4 py-4 font-bold text-slate-700 text-sm  ">{item.mean || item.meaning}</td>
                        <td className="px-4 py-4 hidden lg:table-cell max-w-[250px]">
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[11px] text-slate-600 font-medium line-clamp-2">{item.example}</p>
                            <p className="text-[10px] text-slate-400  line-clamp-1">{item.exampleMeaning}</p>
                        </div>
                    </td>

                    <td className="px-4 py-4 hidden xl:table-cell rounded-r-[20px] max-w-[200px]">
                        <p className="text-[10px] text-slate-400 italic line-clamp-2">
                        {item.note || '---'}
                        </p>
                    </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedDeck.words > 5 && (
                  <div className="mt-6 p-6 border-2 border-dashed border-slate-100 rounded-[30px] flex flex-col items-center justify-center bg-slate-50/30">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <HiOutlineFire className="text-rose-500 animate-bounce" size={24} />
                    </div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">
                      Còn <span className="text-rose-500 text-sm">{selectedDeck.words - 5}</span> từ vựng khác trong bộ này
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Đổi <span className="text-slate-900">{selectedDeck.points} ☀️</span> để mở khóa toàn bộ nội dung</p>
                  </div>
                )}

                
              </div>

              <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-between shrink-0">
                <button onClick={() => setSelectedDeck(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hủy bỏ</button>

                  {(() => {
                      if (!selectedDeck || !myDecks) return null;

                      //  Tìm bộ copy 
                      const myCopy = myDecks.find(m => 
                        String(m.parentCategoryID) === String(selectedDeck.id) || 
                        String(m.id) === String(selectedDeck.id)
                      );

                      const vGoc = Number(selectedDeck?.Version || selectedDeck?.version || 0);
                      const vToi = Number(myCopy?.Version || myCopy?.version || 0);

                      // TH1: CHƯA LƯU
                      if (!myCopy) {
                        return (
                          <button 
                            onClick={handleRedeem} 
                            disabled={loading}
                            className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-[20px] text-[11px] font-[1000] uppercase hover:bg-rose-500 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                          >
                            <HiOutlineDuplicate size={16} /> {loading ? "ĐANG XỬ LÝ..." : `ĐỔI ${selectedDeck.points} ☀️ & LƯU`}
                          </button>
                        );
                      }

                    // TH2: UPDATE
                    if (vGoc > vToi) {
                      const storeCount = Number(selectedDeck?.Words || selectedDeck?.words || 0); 
                      const myCount = Number(myCopy?.Words || myCopy?.words || 0);
                      const diff = storeCount - myCount; 

                      let extraPoints = 0;

                      if (diff > 0) {
                        extraPoints = Math.ceil(diff * 0.6);
                      } else {
                        extraPoints = 5; 
                      }
                      if (diff > 0 && extraPoints < 1) extraPoints = 1;

                      return (
                        <button 
                          onClick={() => handleSyncCollection(selectedDeck.id)} 
                          disabled={loading}
                          className="flex flex-col items-center px-8 py-3 bg-orange-500 text-white rounded-[20px] shadow-lg hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <span className="text-[12px] font-[1000] uppercase">
                            {loading ? "ĐANG ĐỒNG BỘ..." : `ĐỔI THÊM ${extraPoints} ☀️ ĐỂ CẬP NHẬT`}
                          </span>
                          <span className="text-[9px] font-bold opacity-80 uppercase mt-0.5">
                            {diff > 0 ? `Cập nhật thêm ${diff} từ mới` : "Cập nhật dữ liệu bản mới"} (v.{vGoc})
                          </span>
                        </button>
                      );
                    }
                    // TH3 đã lưu và cập nhật
                    return (
                      <button 
                        disabled 
                        className="flex items-center gap-3 px-8 py-3.5 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-[20px] text-[11px] font-[1000] uppercase opacity-80"
                      >
                        <HiOutlineDuplicate size={16} /> ĐÃ CẬP NHẬT BẢN MỚI NHẤT (v.{vToi})
                      </button>
                    );
                  })()}
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