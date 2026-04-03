import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HiOutlineVolumeUp, HiOutlineRefresh, 
  HiOutlineFire, HiOutlineClock, HiOutlineExclamation,
  HiOutlineCheckCircle
} from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

// --- 1. COMPONENT MODAL ---
const ConfirmModal = ({ type, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl text-center border-t-8 border-orange-400 animate-in zoom-in duration-200">
      <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <HiOutlineExclamation size={32} />
      </div>
      <h3 className="text-xl font-black text-gray-800 mb-2 uppercase italic">
        {type === 'exit' ? 'Dừng cuộc chơi?' : 'Thử lại từ đầu?'}
      </h3>
      <p className="text-gray-500 text-sm mb-8 font-medium text-[11px]">Kết quả hiện tại sẽ không được lưu lại đâu nhé!</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 uppercase text-[10px] tracking-widest">Hủy</button>
        <button 
          onClick={onConfirm} 
          className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
        >
          Xác nhận
        </button>
      </div>
    </div>
  </div>
);

const GameMixed = ({ data, onBack }) => { // Nhận data từ cha truyền vào
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // --- LOGIC CHẶN BACK ---
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

  // --- LOGIC HỨNG TÍN HIỆU SIDEBAR ---
  useEffect(() => {
    const checkTrigger = setInterval(() => {
      const trigger = localStorage.getItem('show_exit_trigger');
      if (trigger) {
        setShowModal('exit');
        localStorage.removeItem('show_exit_trigger');
      }
    }, 300);
    return () => clearInterval(checkTrigger);
  }, []);

  const handleConfirmAction = () => {
    const nextRoute = localStorage.getItem('pending_route');
    setShowModal(null);
    if (showModal === 'restart') {
      initGame();
    } else {
      if (nextRoute) {
        localStorage.removeItem('pending_route');
        navigate(nextRoute);
      } else {
        onBack();
      }
    }
  };

  // --- LOGIC TRỘN DATA THÀNH GAME MIXED ---
  const initGame = useCallback(() => {
    if (!data || data.length === 0) return;
    setIsLoading(true);

    try {
      const types = ['MCQ', 'TYPE', 'LISTENING'];
      const formatted = data.map((item) => {
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Tạo distractors (đáp án sai)
        const distractors = data
          .filter(d => d.id !== item.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(d => d.meaning);
        
        const options = [...distractors, item.meaning].sort(() => 0.5 - Math.random());

        return {
          id: item.id,
          type: randomType,
          question: item.hanzi,
          pinyin: item.pinyin,
          answer: item.meaning,
          options: options
        };
      });

      setQuestions(formatted.sort(() => 0.5 - Math.random()));
      setCurrentIdx(0); setScore(0); setTimeLeft(30);
      setIsGameOver(false); setInputValue(""); setSelectedOpt(null); setIsError(false);
    } catch (err) {
      console.error("Lỗi trộn data:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 600);
    }
  }, [data]);

  useEffect(() => { initGame(); }, [initGame]);

  // --- INPUT & TIMER LOGIC ---
  useEffect(() => {
    if (questions[currentIdx]?.type === 'TYPE' && inputRef.current && !showModal) {
        inputRef.current.focus();
    }
    if (timeLeft > 0 && !isGameOver && !showModal && !isLoading && questions.length > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && questions.length > 0) setIsGameOver(true);
  }, [timeLeft, isGameOver, showModal, isLoading, currentIdx, questions]);

  const handleCheck = () => {
    if (isError || !questions[currentIdx]) return;
    const currentQ = questions[currentIdx];
    let isCorrect = false;

    if (currentQ.type === 'TYPE') {
      const input = inputValue.toLowerCase().trim();
      isCorrect = (input === currentQ.answer.toLowerCase() || input === currentQ.pinyin.toLowerCase());
    } else {
      isCorrect = selectedOpt === currentQ.answer;
    }

    if (isCorrect) {
      setScore(prev => prev + 15);
      moveToNext();
    } else {
      setIsError(true);
      setTimeout(moveToNext, 600);
    }
  };

  const moveToNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(30);
      setInputValue("");
      setSelectedOpt(null);
      setIsError(false);
    } else {
      setIsGameOver(true);
    }
  };

  const playAudio = (text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    window.speechSynthesis.speak(u);
  };

  if (isLoading || questions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center font-black text-indigo-500 italic uppercase tracking-widest">ĐANG THIẾT LẬP TRẬN ĐẤU...</div>;
  }

  const currentQ = questions[currentIdx];
  const isPerfect = score === (questions.length * 15);

  return (
    <div className={`min-h-screen bg-[#F9FAFF] p-4 sm:p-8 flex flex-col items-center font-sans relative overflow-x-hidden ${isInputFocused ? 'pb-[40vh]' : 'pb-4'}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>

      {showModal && <ConfirmModal type={showModal} onConfirm={handleConfirmAction} onClose={() => setShowModal(null)} />}

      {/* TOP BAR */}
      <div className="w-full max-w-5xl bg-white rounded-[25px] md:rounded-full px-6 py-4 flex flex-wrap items-center justify-between gap-y-4 mb-10 shadow-sm border border-indigo-50/50">
        <div className="flex items-center gap-4 order-1">
            <span className="text-[10px] font-black text-gray-400 tracking-widest">{currentIdx + 1} / {questions.length}</span>
            <div className="w-24 sm:w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentIdx + 1)/questions.length)*100}%` }} />
            </div>
        </div>

        <div className="flex items-center justify-center gap-6 order-3 sm:order-2 w-full sm:w-auto px-6 border-gray-100 sm:border-x">
            <div className="flex items-center gap-2 text-pink-500 font-black text-sm"><HiOutlineFire size={20} /> {score}</div>
            <div className={`flex items-center gap-2 font-black text-sm ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}><HiOutlineClock size={20} /> {timeLeft}s</div>
        </div>

        <div className="flex items-center gap-4 order-2 sm:order-3">
            <button onClick={() => setShowModal('restart')} className="text-blue-500 font-black text-[10px] md:text-xs uppercase hover:opacity-70 flex items-center gap-1"><HiOutlineRefresh size={18} /> Chơi lại</button>
            <button onClick={() => setShowModal('exit')} className="text-blue-500 font-black text-[10px] px-2 uppercase hover:opacity-70">Thoát</button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className={`w-full max-w-2xl bg-white rounded-[40px] p-8 md:p-12 flex flex-col items-center shadow-sm relative border transition-all min-h-[400px] justify-center mx-auto ${isError ? 'border-red-300 animate-shake' : 'border-gray-50'}`}>
        <div className="h-20 flex items-center justify-center mb-2">
          {currentQ.type === 'LISTENING' ? (
            <button onClick={() => playAudio(currentQ.question)} className="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md border-2 border-white"><HiOutlineVolumeUp size={32}/></button>
          ) : <div className="text-indigo-100 opacity-40"><HiOutlineCheckCircle size={40} /></div>}
        </div>

        <h2 className="font-black text-slate-800 text-center mb-8 text-2xl md:text-3xl">
          {currentQ.type === 'LISTENING' ? "Nghe và chọn đáp án" : currentQ.question}
        </h2>

        <div className="w-full flex justify-center mb-10">
          {currentQ.type === 'TYPE' ? (
            <input
              ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              onFocus={() => setIsInputFocused(true)} onBlur={() => setIsInputFocused(false)}
              placeholder="Nhập đáp án..."
              className={`w-full max-w-md border-2 rounded-2xl py-4 px-6 text-center text-lg font-bold outline-none transition-all ${isError ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-50 bg-slate-50/50 text-slate-700 focus:border-indigo-200'}`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {currentQ.options?.map((opt, i) => (
                <button key={i} onClick={() => setSelectedOpt(opt)} className={`py-4 px-6 rounded-2xl font-bold text-sm transition-all border-2 text-left flex items-center justify-between ${selectedOpt === opt ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-slate-50 bg-slate-50/30 text-slate-600'}`}>
                  <span className="truncate pr-2">{opt}</span>
                  <div className={`w-5 h-5 flex-shrink-0 rounded-full border-2 ${selectedOpt === opt ? 'border-indigo-500 bg-indigo-500' : 'border-slate-200'}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handleCheck} 
          disabled={currentQ.type !== 'TYPE' && !selectedOpt} 
          className={`px-12 py-4 rounded-2xl font-black text-lg shadow-[0_4px_0_#4E8300] active:translate-y-1 active:shadow-none transition-all uppercase italic tracking-wider text-white ${(currentQ.type === 'TYPE' ? inputValue.trim() : selectedOpt) ? 'bg-[#72C100]' : 'bg-slate-200 shadow-none opacity-50'}`}
        >
          {currentIdx === questions.length - 1 ? 'Xong rồi' : 'Tiếp theo'}
        </button>
      </div>

      {/* GAME OVER MODAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <span className="text-7xl mb-4">{isPerfect ? "🏆" : "🤡"}</span>
          <h2 className={`text-3xl font-black mb-2 uppercase italic ${isPerfect ? 'text-gray-800' : 'text-red-500'}`}>{isPerfect ? "XUẤT SẮC!" : "CỐ GẮNG LÊN!"}</h2>
          <div className="my-8 border-y border-gray-100 py-6 px-10">
              <p className="text-gray-400 font-black uppercase text-[10px] mb-2 italic">Tổng điểm</p>
              <p className={`text-7xl font-black ${isPerfect ? 'text-[#72C100]' : 'text-red-400'}`}>{score}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={initGame} className="px-8 py-5 bg-gray-100 text-gray-600 rounded-[25px] font-black uppercase text-xs">Chơi lại</button>
              <button onClick={onBack} className="px-12 py-5 bg-gray-900 text-white rounded-[25px] font-black uppercase text-xs">Xác nhận</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMixed;