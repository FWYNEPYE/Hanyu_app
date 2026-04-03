import React, { useState, useEffect, useCallback } from 'react';
import { 
  HiOutlineClock, HiOutlineFire, HiOutlineRefresh, 
  HiOutlineExclamation, HiOutlineCheckCircle
} from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

const GameMatch = ({ data, onBack }) => {
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]); 
  const [matched, setMatched] = useState([]);   
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wrongPair, setWrongPair] = useState([]); 
  
  const navigate = useNavigate();

  // --- 1. LOGIC CHẶN VUỐT BACK (Cấu trúc cũ) ---
  useEffect(() => {
    if (isGameOver) return;
    window.history.pushState(null, "", window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.pathname);
      setShowModal('exit'); 
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isGameOver]);

  // --- 2. LOGIC HỨNG TÍN HIỆU TỪ SIDEBAR (Cấu trúc cũ) ---
  useEffect(() => {
    const checkTrigger = setInterval(() => {
      const trigger = localStorage.getItem('show_exit_trigger');
      if (trigger) {
        setShowModal('exit');
        localStorage.removeItem('show_exit_trigger');
      }
    }, 300);
    return () => {
      clearInterval(checkTrigger);
      localStorage.removeItem('show_exit_trigger');
    };
  }, []);

  // --- 3. KHỞI TẠO GAME (Khớp số lượng từ từ data truyền vào) ---
  const initGame = useCallback(() => {
    if (!data || data.length === 0) return;

    try {
      setIsLoading(true);
      const playData = data; 

      const hanziCards = playData.map(d => ({ id: d.id, val: d.hanzi, type: 'hanzi' }));
      const meanCards = playData.map(d => ({ id: d.id, val: d.meaning, type: 'mean' }));
      
      const shuffled = [...hanziCards, ...meanCards].sort(() => Math.random() - 0.5);
      
      setCards(shuffled);
      setMatched([]);
      setSelected([]);
      setScore(0);
      setTimeLeft(playData.length * 10); 

      setIsGameOver(false);
      setShowModal(null);
      setWrongPair([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => { initGame(); }, [initGame]);

  // --- 4. GRID DYNAMICS (Giúp hiển thị nhiều thẻ không bị nát) ---
  const getGridClass = () => {
    const total = cards.length;
    if (total <= 12) return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
    if (total <= 24) return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6";
    return "grid-cols-4 sm:grid-cols-6 md:grid-cols-8"; 
  };

  const handleConfirmAction = () => {
    if (showModal === 'restart') { initGame(); return; }
    const nextRoute = localStorage.getItem('pending_route');
    setShowModal(null);
    if (nextRoute) {
      localStorage.removeItem('pending_route');
      navigate(nextRoute);
    } else { onBack(); }
  };

  // --- 5. TIMER LOGIC ---
  useEffect(() => {
    if (timeLeft > 0 && !isGameOver && !showModal && !isLoading) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isGameOver && !isLoading) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver, showModal, isLoading]);

  const handleSelect = (card, index) => {
    if (matched.includes(card.id) || selected.some(s => s.index === index) || selected.length >= 2 || wrongPair.length > 0) return;

    const newSelected = [...selected, { ...card, index }];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (first.id === second.id && first.type !== second.type) {
        setMatched(prev => [...prev, first.id]);
        setScore(prev => prev + 20);
        setSelected([]);
        if (matched.length + 1 === data.length) {
          setTimeout(() => setIsGameOver(true), 500);
        }
      } else {
        setWrongPair([first.index, second.index]);
        if (window.navigator.vibrate) window.navigator.vibrate(100); 
        setTimeout(() => {
          setSelected([]);
          setWrongPair([]);
          setTimeLeft(prev => Math.max(0, prev - 2)); 
        }, 600);
      }
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-500 italic uppercase">ĐANG TẢI...</div>;

  const isWin = matched.length === data.length && data.length > 0;

  return (
    <div className="min-h-screen bg-[#F9FAFF] p-4 sm:p-8 flex flex-col items-center font-sans relative overflow-x-hidden">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>

      {/* --- MODAL THOÁT (Cấu trúc cũ) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl text-center border-t-8 border-orange-400 animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2 uppercase italic">{showModal === 'exit' ? 'Thoát trò chơi?' : 'Thử lại từ đầu?'}</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium">Tiến trình sẽ biến mất vĩnh viễn đấy!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 uppercase text-[10px]">Hủy</button>
              <button onClick={handleConfirmAction} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px]">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOP BAR (Cấu trúc cũ) --- */}
      <div className="w-full max-w-5xl bg-white rounded-[25px] md:rounded-full px-4 md:px-8 py-3 md:py-4 flex flex-wrap items-center justify-between gap-y-4 mb-8 shadow-sm border border-indigo-50/50">
        <div className="flex items-center gap-3 md:gap-6 order-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{matched.length} / {data.length}</span>
            <div className="w-20 md:w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${(matched.length / (data.length || 1)) * 100}%` }} />
            </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8 px-4 border-l md:border-x border-gray-100 order-3 sm:order-2 w-full sm:w-auto justify-around sm:justify-center">
            <div className="flex items-center gap-1.5 text-pink-500 font-black text-xs md:text-sm"><HiOutlineFire size={18}/> <span>{score}</span></div>
            <div className={`flex items-center gap-1.5 font-black text-xs md:text-sm ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}><HiOutlineClock size={18}/> <span>{timeLeft}s</span></div>
        </div>

        <div className="flex items-center gap-4 order-2 sm:order-3">
            <button onClick={() => setShowModal('restart')} className="text-blue-500 font-black text-[10px] uppercase flex items-center gap-1 hover:opacity-70"><HiOutlineRefresh size={18}/> Chơi lại</button>
            <button onClick={() => setShowModal('exit')} className="text-blue-500 font-black text-[10px] uppercase px-2 hover:opacity-70">THOÁT</button>
        </div>
      </div>

      {/* --- GAME BOARD (Thêm getGridClass) --- */}
      <div className={`grid ${getGridClass()} gap-3 sm:gap-6 w-full max-w-6xl px-2 mb-10`}>
        {cards.map((card, index) => {
          const isSelected = selected.some(s => s.index === index);
          const isMatched = matched.includes(card.id);
          const isWrong = wrongPair.includes(index);

          return (
            <button
              key={index}
              disabled={isMatched || isWrong}
              onClick={() => handleSelect(card, index)}
              className={`
                aspect-[4/3] sm:aspect-video rounded-[25px] sm:rounded-[35px] font-black transition-all duration-300 flex items-center justify-center p-3 sm:p-6 text-center shadow-sm border-4
                ${isMatched ? 'bg-green-50 border-green-200 text-green-500 opacity-0 pointer-events-none scale-75' : 
                  isSelected ? 'bg-indigo-600 border-indigo-300 text-white scale-105 shadow-xl' : 
                  isWrong ? 'bg-red-500 border-red-300 text-white animate-shake' :
                  'bg-white border-transparent hover:border-indigo-100 text-slate-600 hover:-translate-y-1 active:scale-95'}
                ${cards.length > 20 ? 'text-[10px] sm:text-xs' : 'text-sm sm:text-xl'}
              `}
            >
              {isMatched ? <HiOutlineCheckCircle size={40} /> : card.val}
            </button>
          );
        })}
      </div>

      {/* --- GAME OVER MODAL (Cấu trúc cũ) --- */}
      {isGameOver && (
        <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
          <span className={`text-7xl mb-4 ${!isWin ? 'animate-bounce' : ''}`}>{isWin ? "🏆" : "😵"}</span>
          <h2 className={`text-4xl font-black mb-2 italic uppercase ${isWin ? 'text-gray-800' : 'text-red-500'}`}>{isWin ? "Tuyệt vời!" : "Hết giờ!"}</h2>
          <div className="my-6 border-y border-gray-100 py-6 px-10">
             <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Điểm đạt được</p>
             <p className={`text-7xl font-black ${isWin ? 'text-[#72C100]' : 'text-red-400'}`}>{isWin ? score + (timeLeft * 2) : score}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
             <button onClick={initGame} className="px-8 py-5 bg-gray-100 text-gray-600 rounded-[25px] font-black uppercase text-xs tracking-widest">Chơi lại</button>
             <button onClick={onBack} className="px-12 py-5 bg-gray-900 text-white rounded-[25px] font-black uppercase text-xs tracking-widest hover:bg-[#72C100] transition-colors">Xác nhận</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMatch;