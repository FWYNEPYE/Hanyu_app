import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HiOutlineVolumeUp, HiOutlineRefresh, 
  HiOutlineFire, HiOutlineClock, HiOutlineExclamation 
} from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

const GameType = ({ filters, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [mode, setMode] = useState('vi-cn'); 
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isFocused, setIsFocused] = useState(false); 
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // --- 1. LOGIC CHẶN VUỐT BACK (MOBILE) ---
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

  // --- 2. LOGIC HỨNG TÍN HIỆU TỪ SIDEBAR ---
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

  // --- 3. HÀM XÁC NHẬN THOÁT/CHƠI LẠI ---
  const handleConfirmAction = () => {
    if (showModal === 'restart') {
      initGame();
      return;
    }
    const nextRoute = localStorage.getItem('pending_route');
    setShowModal(null);
    if (nextRoute) {
      localStorage.removeItem('pending_route');
      navigate(nextRoute);
    } else {
      onBack();
    }
  };

  const initGame = useCallback(async () => {
    try {
      setIsLoading(true);
      const mockData = [
        { id: 1, cn: "老师", vi: "giáo viên, thầy giáo", type: "NOUN", pinyin: "laoshi" },
        { id: 2, cn: "真", vi: "đúng sự thật, thật thà", type: "ADJ", pinyin: "zhen" },
      ];
      setQuestions(mockData);
      setCurrentIdx(0); setScore(0); setTimeLeft(30);
      setIsGameOver(false); setShowModal(null); setInputValue(""); setIsError(false);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  // Tự động focus khi sang câu mới
  useEffect(() => {
    if (!isLoading && inputRef.current && !showModal && !isGameOver) {
      inputRef.current.focus();
    }
  }, [currentIdx, mode, isLoading, showModal, isGameOver]);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver && !showModal && !isLoading) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isGameOver) setIsGameOver(true);
  }, [timeLeft, isGameOver, showModal, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || isError) return;

    const currentQ = questions[currentIdx];
    const input = inputValue.toLowerCase().trim();
    
    // Check đúng cho cả Hanzi hoặc Pinyin nếu là mode vi-cn
    const isCorrect = mode === 'vi-cn' 
      ? (input === currentQ.cn || input === currentQ.pinyin.toLowerCase()) 
      : currentQ.vi.split(',').map(v => v.trim().toLowerCase()).includes(input);

    if (isCorrect) {
      setScore(prev => prev + 10);
      setInputValue('');
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setTimeLeft(30);
      } else {
        setIsGameOver(true);
      }
    } else {
      setIsError(true);
      if (window.navigator.vibrate) window.navigator.vibrate(200);
      setTimeout(() => {
        setIsError(false);
        setInputValue('');
        if (currentIdx < questions.length - 1) {
          setCurrentIdx(prev => prev + 1);
          setTimeLeft(30);
        } else {
          setIsGameOver(true);
        }
      }, 600);
    }
  };

  const playTTS = () => {
    const utterance = new SpeechSynthesisUtterance(questions[currentIdx].cn);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  if (isLoading || questions.length === 0) return (
    <div className="min-h-screen flex items-center justify-center font-black text-indigo-400 italic">ĐANG TẢI...</div>
  );

  const isPerfect = questions.length > 0 && score === questions.length * 10;

  return (
    <div className={`min-h-screen bg-[#F9FAFF] p-4 sm:p-8 flex flex-col items-center font-sans relative transition-all duration-300 ${isFocused ? 'pb-[40vh]' : 'pb-4'}`}>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>

      {/* MODAL THOÁT & RESTART */}
      {showModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl text-center border-t-8 border-orange-400 animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2 uppercase italic">{showModal === 'exit' ? 'Thoát trò chơi?' : 'Thử lại đầu?'}</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium ">Tiến trình hiện tại sẽ bị mất sạch đấy!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 uppercase text-[10px]">Hủy</button>
              <button onClick={handleConfirmAction} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px]">Đồng ý</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="w-full max-w-5xl bg-white rounded-[25px] md:rounded-full px-6 py-4 flex flex-wrap items-center justify-between gap-y-4 mb-10 shadow-sm border border-indigo-50/50">
        <div className="flex items-center gap-4 order-1">
            <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">{currentIdx + 1} / {questions.length}</span>
            <div className="w-24 sm:w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${((currentIdx + 1)/questions.length)*100}%` }} />
            </div>
        </div>

        <div className="flex items-center gap-6 px-4 border-l md:border-x border-gray-100 order-3 sm:order-2 w-full sm:w-auto justify-around sm:justify-center">
            <div className="flex items-center gap-2 text-pink-500 font-black text-sm"><HiOutlineFire size={20} /> {score}</div>
            <div className={`flex items-center gap-2 font-black text-sm ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}><HiOutlineClock size={20} /> {timeLeft}s</div>
        </div>

        <div className="flex items-center gap-4 order-2 sm:order-3">
            <button onClick={() => setMode(mode === 'vi-cn' ? 'cn-vi' : 'vi-cn')} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">{mode === 'vi-cn' ? 'VI ➔ CN' : 'CN ➔ VI'}</button>
            <button onClick={() => setShowModal('restart')} className="text-blue-500 font-black text-[10px] uppercase hover:opacity-70 flex items-center gap-1">
                <HiOutlineRefresh size={18} /> Chơi lại
            </button>
            <button onClick={() => setShowModal('exit')} className="text-blue-500 font-black text-xs px-2 hover:opacity-70">THOÁT</button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className={`w-full max-w-2xl bg-white rounded-[40px] md:rounded-[60px] p-8 md:p-16 flex flex-col items-center shadow-xl relative border transition-all ${isError ? 'border-red-300 animate-shake' : 'border-white'}`}>
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-6 tracking-tight text-center">
          {mode === 'vi-cn' ? questions[currentIdx].vi : questions[currentIdx].cn}
        </h2>
        
        <div className="flex items-center gap-3 mb-10">
          <button onClick={playTTS} className="text-sky-400 hover:scale-110 active:scale-95 transition-transform bg-sky-50 p-2 rounded-full">
            <HiOutlineVolumeUp size={28}/>
          </button>
          <span className="bg-purple-100 text-purple-600 text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest italic">
            {questions[currentIdx].type}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md mb-8">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={mode === 'vi-cn' ? "Gõ Hanzi hoặc Pinyin..." : "Gõ nghĩa tiếng Việt..."}
            className={`w-full border-4 rounded-full py-4 md:py-6 px-8 text-center text-xl md:text-2xl font-bold outline-none transition-all shadow-inner 
              ${isError ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-50 bg-slate-50/50 text-slate-700 focus:border-sky-200'}`}
          />
        </form>

        <button 
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className={`px-16 py-5 rounded-[25px] font-black text-xl md:text-2xl shadow-[0_6px_0_#4E8300] active:translate-y-1 active:shadow-none transition-all uppercase italic tracking-tighter text-white
            ${inputValue.trim() ? 'bg-[#72C100] hover:bg-[#63A700]' : 'bg-slate-200 shadow-none cursor-not-allowed'}
          `}
        >
          Kiểm tra
        </button>
      </div>

      {/* KẾT QUẢ */}
      {isGameOver && (
        <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <span className={`text-7xl mb-4 ${!isPerfect ? 'animate-bounce' : ''}`}>{isPerfect ? "🏆" : "😏"}</span>
          <h2 className={`text-3xl font-black mb-2 italic uppercase ${isPerfect ? 'text-gray-800' : 'text-red-500'}`}>{isPerfect ? "XUẤT SẮC!" : "Cố gắng lên nhé!"}</h2>
          <div className="my-8 text-center border-y border-gray-100 py-6 px-10">
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-2 italic">Tổng điểm</p>
              <p className={`text-7xl font-black tracking-tighter ${isPerfect ? 'text-[#72C100]' : 'text-red-400'}`}>{score}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => { initGame(); }} className="px-8 py-5 bg-gray-100 text-gray-600 rounded-[25px] font-black uppercase text-xs tracking-widest">Chơi lại</button>
              <button onClick={onBack} className="px-12 py-5 bg-gray-900 text-white rounded-[25px] font-black uppercase text-xs tracking-widest">Xác nhận</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameType;