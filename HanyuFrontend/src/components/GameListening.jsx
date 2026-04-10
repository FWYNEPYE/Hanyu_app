import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HiOutlineRefresh, HiOutlineFire, 
  HiOutlineClock, HiOutlineExclamation
} from "react-icons/hi";
import { FaHeadphones } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const GameListening = ({ filters, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); 
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // ---  LOGIC CHẶN VUỐT BACK ---
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
    };
  }, []);

  // ---  HÀM XÁC NHẬN THOÁT CHUẨN ---
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

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const mockData = [
        { id: 1, cn: "老师", pinyin: "laoshi", type: "NOUN" },
        { id: 2, cn: "谢谢", pinyin: "xiexie", type: "VERB" },
        { id: 3, cn: "苹果", pinyin: "pingguo", type: "NOUN" },
      ];
      setQuestions(mockData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initGame = useCallback(() => {
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(45);
    setIsGameOver(false);
    setShowModal(null);
    setInputValue("");
    setHasStarted(false);
    setIsInputFocused(false);
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const currentQ = questions[currentIdx] || null;

  const playAudio = useCallback(() => {
    if (!currentQ) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQ.cn);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8; 
    window.speechSynthesis.speak(utterance);
  }, [currentQ]);

  useEffect(() => {
    if (!isLoading && currentQ && !isGameOver && !showModal && hasStarted) {
      playAudio();
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, isLoading, isGameOver, showModal, hasStarted, playAudio]);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver && !showModal && !isLoading && hasStarted) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && hasStarted) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver, showModal, isLoading, hasStarted]);

  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (!hasStarted) setHasStarted(true); // Kích hoạt âm thanh khi user chạm input lần đầu
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || !currentQ || isError) return;
    
    const input = inputValue.toLowerCase().trim();
    const isCorrect = input === currentQ.cn || input === currentQ.pinyin.toLowerCase();

    if (isCorrect) {
      setScore(prev => prev + 15);
      setInputValue('');
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setTimeLeft(45);
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
          setTimeLeft(45);
        } else {
          setIsGameOver(true);
        }
      }, 400);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-400 italic uppercase">ĐANG TẢI...</div>;

  const isPerfect = score === (questions.length * 15) && questions.length > 0;

  return (
    <div className={`min-h-screen bg-[#F9FAFF] p-4 sm:p-8 flex flex-col items-center font-sans relative overflow-x-hidden transition-all duration-300 ${isInputFocused ? 'pb-[40vh]' : 'pb-4'}`}>
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
            <h3 className="text-xl font-black text-gray-800 mb-2 uppercase italic">{showModal === 'exit' ? 'Thoát trò chơi?' : 'Chơi lại?'}</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium ">Tiến trình sẽ không được lưu lại!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 uppercase text-[10px]">Hủy</button>
              <button onClick={handleConfirmAction} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px]">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="w-full max-w-5xl bg-white rounded-[25px] md:rounded-full px-5 md:px-10 py-3 md:py-4 flex flex-wrap items-center justify-between gap-y-3 mb-8 shadow-sm border border-indigo-50/50">
        <div className="flex items-center gap-3 md:gap-6 order-1">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{currentIdx + 1} / {questions.length}</span>
            <div className="w-20 md:w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-300 transition-all duration-500" style={{ width: `${((currentIdx + 1)/questions.length)*100}%` }} />
            </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-8 order-3 sm:order-2 w-full sm:w-auto justify-around sm:justify-center px-4 sm:border-x border-gray-100">
            <div className="flex items-center gap-1.5 text-indigo-400 font-black text-xs md:text-sm"><HiOutlineFire size={18}/> {score}</div>
            <div className={`flex items-center gap-1.5 font-black text-xs md:text-sm ${timeLeft < 5 ? 'text-red-400 animate-pulse' : 'text-blue-300'}`}><HiOutlineClock size={18}/> {timeLeft}s</div>
        </div>
        <div className="flex items-center gap-4 order-2 sm:order-3">
            <button onClick={() => setShowModal('restart')} className="text-blue-500 font-black text-[10px] uppercase flex items-center gap-1 hover:opacity-70"><HiOutlineRefresh size={16}/> Chơi lại</button>
            <button onClick={() => setShowModal('exit')} className="text-blue-500 font-black text-[10px] uppercase px-2 hover:opacity-70">THOÁT</button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className={`w-full max-w-2xl bg-white rounded-[40px] md:rounded-[60px] p-8 md:p-16 flex flex-col items-center shadow-xl relative border transition-all min-h-[400px] md:min-h-[450px] justify-center mx-auto ${isError ? 'border-red-300 animate-shake' : 'border-white'}`}>
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
            <button onClick={playAudio} className="w-20 h-20 md:w-28 md:h-28 bg-[#E0E7FF] text-[#6366F1] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg border-[6px] border-white">
                <FaHeadphones size={32} className="md:size-[48px]" />
            </button>
            <div className="flex flex-col items-center gap-2">
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Nghe và gõ lại từ</h3>
                <span className="bg-pink-50 text-pink-400 text-[10px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest ">{currentQ?.type}</span>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md mb-10">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={() => setIsInputFocused(false)}
            placeholder={hasStarted ? "Gõ Hanzi hoặc Pinyin..." : "Chạm vào đây để bắt đầu..."}
            className={`w-full border-4 rounded-full py-4 md:py-5 px-8 text-center text-lg md:text-base font-bold outline-none transition-all shadow-inner 
              ${isError ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-50 bg-slate-50/50 text-slate-600 focus:border-indigo-200'}`}
          />
        </form>

        <button 
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className={`w-full max-w-xs py-4 md:py-5 rounded-[25px] font-black text-xl md:text-base transition-all uppercase  tracking-widest text-white
            ${inputValue.trim() ? 'bg-[#818CF8] shadow-[0_6px_0_#6366F1] active:translate-y-1 active:shadow-none' : 'bg-slate-200 cursor-not-allowed opacity-50'}
          `}
        >
          {currentIdx === questions.length - 1 ? 'Hoàn tất' : 'Kiểm tra'}
        </button>
      </div>

      {/* MODAL KẾT THÚC */}
      {isGameOver && (
        <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <span className={`text-7xl mb-4 ${!isPerfect ? 'animate-bounce' : ''}`}>{isPerfect ? "🏆" : "🤡"}</span>
          <h2 className={`text-3xl font-black mb-2 italic uppercase ${isPerfect ? 'text-gray-800' : 'text-red-500'}`}>{isPerfect ? "XUẤT SẮC!" : "Tai đang đi chơi à?"}</h2>
          <div className="my-8 border-y border-gray-100 py-6 px-10">
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-2 italic">Tổng điểm tích lũy</p>
              <p className={`text-7xl font-black tracking-tighter ${isPerfect ? 'text-indigo-500' : 'text-red-400'}`}>{score}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => { initGame(); fetchQuestions(); }} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[25px] font-black uppercase text-xs tracking-widest">Chơi lại</button>
              <button onClick={onBack} className="px-12 py-5 bg-gray-900 text-white rounded-[25px] font-black uppercase text-xs tracking-widest">Xác nhận</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameListening;