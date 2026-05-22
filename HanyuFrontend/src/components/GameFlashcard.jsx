import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  HiOutlineVolumeUp, HiOutlineX, HiOutlineCheck,
  HiOutlineRefresh, HiOutlineExclamation 
} from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

const GameFlashcard = ({ data, onBack }) => {
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showModal, setShowModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // State mới
  const [status, setStatus] = useState('idle'); 
  const [wrongCards, setWrongCards] = useState([]); // Lưu danh sách các từ bấm X

  const inputRef = useRef(null);
  const navigate = useNavigate();

  // ---  CHẶN VUỐT BACK ---
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

  // --- LOGIC HỨNG TÍN HIỆU TỪ SIDEBAR ---
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
      localStorage.removeItem('pending_route');
    };
  }, []);

  const handleConfirmExit = () => {
    const nextRoute = localStorage.getItem('pending_route');
    setShowModal(null);
    if (nextRoute) {
      localStorage.removeItem('pending_route');
      navigate(nextRoute);
    } else {
      onBack();
    }
  };

  
  useEffect(() => {
    if (data && data.length > 0) {
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setCards(shuffled);
      setIsLoading(false);
    }
  }, [data]);

  // --- GAME ACTIONS ---
  const handleFocus = () => {
    setIsInputFocused(true);
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  // chuyển bài khi bấm 2 nút ở dưới
  const handleNext = useCallback((isCorrect = false) => {
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      // Nếu bấm X lưu vào danh sách từ sai
      setWrongCards(prev => [...prev, cards[currentIdx]]);
    }
    
    if (currentIdx === cards.length - 1) {
      setIsGameOver(true);
    } else {
      setFlipped(false);
      setInputValue("");
      setIsInputFocused(false);
      setStatus('idle');
      setTimeout(() => setCurrentIdx((prev) => prev + 1), 200);
    }
  }, [cards, currentIdx]);

  const checkInput = () => {
    if (!cards[currentIdx]) return;
    const isRight = inputValue.trim().toLowerCase() === cards[currentIdx].meaning.toLowerCase();
    
    if (isRight) {
      setStatus('success');
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 500);
    }
  };

  const initGame = () => {
    setCurrentIdx(0);
    setScore(0);
    setIsGameOver(false);
    setFlipped(false);
    setInputValue("");
    setWrongCards([]);
    setShowModal(null);
    setStatus('idle');
  };

  const playAudio = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-500 italic uppercase tracking-widest">ĐANG TẢI...</div>;

  const currentCard = cards[currentIdx];
  const isPerfect = score === cards.length;

  return (
    <div className={`min-h-screen bg-[#F9FAFF] p-4 md:p-8 flex flex-col items-center font-sans transition-all duration-300 ${isInputFocused ? 'pb-[30vh]' : 'pb-4'}`}>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>

      {/* MODAL THOÁT & RESTART */}
      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl text-center border-t-8 border-orange-400 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-6">{showModal === 'exit' ? 'Thoát trò chơi?' : 'Chơi lại?'}</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium">Tiến trình sẽ không được lưu lại!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 text-[10px] uppercase tracking-widest">Hủy</button>
              <button onClick={showModal === 'exit' ? handleConfirmExit : initGame} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Đồng ý</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="w-full max-w-4xl bg-white rounded-[25px] md:rounded-full px-5 md:px-10 py-4 flex items-center justify-between mb-8 shadow-sm border border-indigo-50/50">
            <div className="flex items-center gap-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{currentIdx + 1} / {cards.length}</span>
                <div className="w-32 md:w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-300 transition-all duration-500" style={{ width: `${((currentIdx + 1) / cards.length) * 100}%` }} />
                </div>
            </div>
            <div className="flex gap-4">
                <button onClick={() => setShowModal('restart')} className="text-blue-500 font-black text-xs uppercase flex items-center gap-1 hover:opacity-70 tracking-tighter"><HiOutlineRefresh size={18}/> Chơi lại</button>
                <button onClick={() => setShowModal('exit')} className="text-blue-500 font-black text-xs uppercase px-2 hover:opacity-70 tracking-tighter">Thoát</button>
            </div>
      </div>

      {/* FLASHCARD  */}
      <div className="relative w-full max-w-[340px] md:max-w-[500px] aspect-[16/10] md:aspect-[21/9] mb-8 cursor-pointer group" onClick={() => setFlipped(!flipped)}>
          <div className={`relative w-full h-full transition-all duration-700 preserve-3d rounded-[40px] shadow-xl ${flipped ? 'rotate-y-180' : ''}`}>
            <div className="absolute inset-0 bg-[#E0E7FF] rounded-[40px] flex items-center justify-center backface-hidden border-[6px] border-white text-center">
                <h3 className="text-3xl md:text-5xl font-black text-[#6366F1]">{currentCard?.hanzi}</h3>
            </div>
            <div className="absolute inset-0 bg-[#FDF2F8] border-[6px] border-white rounded-[40px] flex flex-col items-center justify-center rotate-y-180 backface-hidden p-6 text-center">
               <span className="text-pink-400 font-black text-lg mb-2  tracking-widest">/{currentCard?.pinyin}/</span>
               <h3 className="text-2xl md:text-3xl font-black text-[#BE185D] leading-tight">{currentCard?.meaning}</h3>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); playAudio(currentCard?.hanzi); }} className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-blue-300 text-white p-3 rounded-full shadow-lg z-20 border-[4px] border-[#F9FAFF] hover:scale-110 active:scale-95 transition-all">
            <HiOutlineVolumeUp size={22} />
          </button>
      </div>

      {/* INPUT AREA */}
      <div className={`w-full max-w-[340px] md:max-w-[450px] flex gap-2 mb-10 ${status === 'error' ? 'animate-shake' : ''}`}>
        <input 
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if(status !== 'idle') setStatus('idle');
          }}
          onFocus={handleFocus}
          onBlur={() => setIsInputFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && checkInput()}
          placeholder="Nhập nghĩa..."
          className={`flex-1 bg-white border-2 px-6 py-4 rounded-[25px] font-bold outline-none transition-all shadow-sm ${
            status === 'success' ? 'border-green-400 text-green-600 bg-green-50' : 
            status === 'error' ? 'border-red-400 text-red-500' : 'border-indigo-50 text-slate-600 focus:border-indigo-300'
          }`}
        />
        <button onClick={checkInput} className={`px-8 py-4 rounded-[25px] font-black text-xs uppercase shadow-lg transition-all ${
          status === 'success' ? 'bg-green-500 text-white' : 'bg-indigo-400 text-white active:scale-95'
        }`}>Check</button>
      </div>

      {/* QUICK ACTIONS  */}
      <div className="flex gap-10">
          <button onClick={() => handleNext(false)} className="w-16 h-16 bg-white text-red-300 rounded-full flex items-center justify-center shadow-xl border border-red-50 hover:bg-red-500 hover:text-white transition-all duration-300">
            <HiOutlineX size={32}/>
          </button>
          <button onClick={() => handleNext(true)} className="w-16 h-16 bg-white text-green-300 rounded-full flex items-center justify-center shadow-xl border border-green-50 hover:bg-green-500 hover:text-white transition-all duration-300">
            <HiOutlineCheck size={32}/>
          </button>
      </div>

      {/* MODAL KẾT THÚC -HIỆN DANH SÁCH TỪ QUÊN */}
      {isGameOver && (
        <div className="fixed inset-0 z-[110] bg-white overflow-y-auto flex flex-col items-center p-8 animate-in fade-in duration-500">
          <div className="max-w-2xl w-full flex flex-col items-center">
            <span className="text-4xl mb-4">{isPerfect ? "🏆" : "🤪"}</span>
            <h2 className="text-2xl font-black mb-2 uppercase italic text-gray-800">
              {isPerfect ? "XUẤT SẮC!" : "Hơi gàaaa!"}
            </h2>
            
            <div className="my-6 border-y border-gray-100 py-6 px-10 text-center w-full">
                <p className="text-gray-400 font-black uppercase text-[13px] mb-0 tracking-widest">Điểm đạt được</p>
                <p className="text-4xl font-black text-indigo-500">{score} / {cards.length}</p>
            </div>

            {/* DANH SÁCH TỪ QUÊN */}
            {wrongCards.length > 0 && (
              <div className="w-full mb-10">
                <h4 className="text-red-400 font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <HiOutlineX size={16}/> Cần ôn lại ({wrongCards.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wrongCards.map((card, idx) => (
                    <div key={idx} className="bg-red-50 p-4 rounded-2xl flex justify-between items-center border border-red-100">
                      <div>
                        <p className="text-xl font-black text-red-600">{card.hanzi}</p>
                        <p className="text-xs text-red-400 font-medium">{card.pinyin}</p>
                      </div>
                      <p className=" text-sm font-bold ml-4 text-red-700">{card.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button onClick={initGame} className="px-8 py-5 bg-gray-100 text-gray-600 rounded-[25px] font-black uppercase text-xs tracking-widest">Chơi lại</button>
                <button onClick={onBack} className="px-12 py-5 bg-gray-900 text-white rounded-[25px] font-black uppercase text-xs tracking-widest hover:bg-green-500">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameFlashcard;