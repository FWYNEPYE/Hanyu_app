import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  HiOutlineClock, HiOutlineFire, HiOutlineRefresh, 
  HiOutlineVolumeUp, HiOutlineExclamation
} from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

const GameMCQ = ({ data, onBack, allVocabs = [] }) => { // Nhận data từ Game.jsx
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showModal, setShowModal] = useState(null); 
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const navigate = useNavigate();

  // --- 0. LOGIC ĐẾM NGƯỢC THỜI GIAN (ĐÃ SỬA: HẾT GIỜ LÀ END GAME) ---
  useEffect(() => {
    if (isGameOver || isLoading || showModal || selectedAnswer) return;

    // SỬA TẠI ĐÂY: Nếu thời gian về 0, không chuyển câu nữa mà END GAME luôn
    if (timeLeft === 0) {
      setIsGameOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGameOver, isLoading, showModal, selectedAnswer]);


  // --- 1. LOGIC CHẶN VUỐT BACK ---
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

  // --- 3. LOGIC TẠO CÂU HỎI TỔNG LỰC ---
  useEffect(() => {
    if (!data || data.length === 0 || questions.length > 0) return;

    const generateQuestions = () => {
      try {
        const pool = (allVocabs && allVocabs.length > 0) ? allVocabs : data;

        const formatted = data.map((item) => {
          const currentId = item.vocaId || item.VocaId;
          const currentMeaning = item.meaning || item.Meaning;

          let distractors = pool
            .filter(d => (d.vocaId || d.VocaId) !== currentId)
            .map(d => d.meaning || d.Meaning)
            .filter(m => m && m !== currentMeaning);

          distractors = [...new Set(distractors)];

          let shuffledDistractors = distractors
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);

          const backup = ["Học tập", "Sức khỏe", "Thành công", "Vui vẻ", "Gia đình"];
          let bIdx = 0;
          while (shuffledDistractors.length < 3) {
            const word = backup[bIdx] || `Lựa chọn ${shuffledDistractors.length + 1}`;
            if (!shuffledDistractors.includes(word) && word !== currentMeaning) {
              shuffledDistractors.push(word);
            }
            bIdx++;
          }

          const options = [...shuffledDistractors, currentMeaning].sort(() => 0.5 - Math.random());

          return {
            id: currentId,
            word: item.hanzi || item.Hanzi,
            pinyin: item.pinyin || item.Pinyin,
            correct: currentMeaning,
            options: options
          };
        });

        setQuestions(formatted);
        setIsLoading(false); 
      } catch (err) {
        console.error("Lỗi trộn game:", err);
        setIsLoading(false);
      }
    };

    generateQuestions();
  }, [data, allVocabs, questions.length]); 

  const initGame = () => {
    setQuestions([]);
    setIsLoading(true);
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(15);
    setIsGameOver(false);
    setShowModal(null);
    setSelectedAnswer(null);
  };

  const handleAnswer = (choice) => {
    if (selectedAnswer || isGameOver) return; 
    setSelectedAnswer(choice);

    const isCorrect = choice === questions[currentIdx].correct;
    if (isCorrect) setScore(prev => prev + 10);

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setTimeLeft(15); 
        setSelectedAnswer(null);
      } else {
        setIsGameOver(true);
      }
    }, 600); 
  };

  const playAudio = (text) => {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-CN';
    window.speechSynthesis.speak(msg);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-500 italic uppercase tracking-widest">ĐANG TRỘN ĐÁP ÁN...</div>;

  const isPerfect = questions.length > 0 && score === questions.length * 10;

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

      {/* MODAL THOÁT & RESTART */}
      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(null)} />
          <div className="relative bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl text-center border-t-8 border-orange-400">
            <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineExclamation size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-tighter">{showModal === 'exit' ? 'Thoát trò chơi?' : 'Chơi lại?'}</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium">Tiến trình sẽ không được lưu lại!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(null)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-400 text-[10px] uppercase tracking-widest">Hủy</button>
              <button onClick={showModal === 'exit' ? handleConfirmExit : initGame} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Đồng ý</button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
      <div className="w-full max-w-5xl bg-white rounded-[25px] md:rounded-full px-5 md:px-10 py-3 md:py-4 flex flex-wrap items-center justify-between gap-y-3 mb-8 shadow-sm border border-indigo-50/50">
        <div className="flex items-center gap-3 md:gap-6 order-1">
            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">{currentIdx + 1} / {questions.length}</span>
            <div className="w-20 md:w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: `${((currentIdx + 1)/questions.length)*100}%` }} />
            </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8 px-4 border-l md:border-x border-gray-100 order-3 sm:order-2 w-full sm:w-auto justify-around sm:justify-center">
          <div className="flex items-center gap-1.5 text-pink-500 font-black text-xs md:text-sm"><HiOutlineFire size={18}/> {score}</div>
          <div className={`flex items-center gap-1.5 font-black text-xs md:text-sm ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}><HiOutlineClock size={18}/> {timeLeft}s</div>
        </div>

        <div className="flex items-center gap-4 order-2 sm:order-3">
            <button onClick={() => setShowModal('restart')} className="text-blue-500 font-black text-[10px] md:text-xs uppercase flex items-center gap-1 hover:opacity-70">
                <HiOutlineRefresh size={18} /> Chơi lại
            </button>
            <button onClick={() => setShowModal('exit')} className="text-blue-500 font-black text-[10px] uppercase px-2 hover:opacity-70">THOÁT</button>
        </div>
      </div>

      {/* MAIN GAME */}
      <div className="w-full max-w-2xl bg-white p-4 sm:p-8 rounded-[50px] md:rounded-[60px] shadow-2xl text-center border border-white relative">
        <div className="flex flex-col items-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-2 tracking-tighter">{questions[currentIdx]?.word}</h3>
            <p className="text-gray-400 font-black mb-1 md:mb-4 text-base tracking-widest">/{questions[currentIdx]?.pinyin}/</p>
            <button 
              onClick={() => playAudio(questions[currentIdx]?.word)}
              className="bg-indigo-600 text-white p-2 md:p-3 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
                <HiOutlineVolumeUp size={23} />
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
          {questions[currentIdx]?.options.map((opt, i) => {
            const isSelected = selectedAnswer === opt;
            const isCorrectChoice = isSelected && opt === questions[currentIdx].correct;
            const isWrongChoice = isSelected && opt !== questions[currentIdx].correct;
            const shouldShowGreen = selectedAnswer && opt === questions[currentIdx].correct;

            return (
              <button 
                key={i} 
                onClick={() => handleAnswer(opt)} 
                disabled={!!selectedAnswer}
                className={`
                  py-4 md:py-6 rounded-[25px] md:rounded-[30px] font-bold text-sm md:text-base whitespace-normal break-words text-center transition-all active:scale-95 border-4
                  ${isCorrectChoice || shouldShowGreen ? 'bg-green-500 border-green-200 text-white' : 
                    isWrongChoice ? 'bg-red-500 border-red-200 text-white animate-shake' : 
                    'bg-gray-50 border-transparent text-slate-600 hover:bg-white hover:border-indigo-100'}
                `}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL KẾT THÚC */}
      {isGameOver && (
        <div className="fixed inset-0 z-[110] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <span className={`text-7xl mb-4 ${!isPerfect ? 'animate-bounce' : ''}`}>
            {isPerfect ? "🏆" : "💪"}
          </span>
          <h2 className={`text-3xl font-black mb-2 italic uppercase ${isPerfect ? 'text-gray-800' : 'text-red-500'}`}>
            {isPerfect ? "XUẤT SẮC!" : "HẾT GIỜ RỒI!"}
          </h2>
          <div className="my-8 border-y border-gray-100 py-6 px-10">
              <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-2">Điểm đạt được</p>
              <p className={`text-4xl font-black ${isPerfect ? 'text-[#72C100]' : 'text-red-400'}`}>{score}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={initGame} className="px-8 py-5 bg-gray-100 text-gray-600 rounded-[25px] font-black uppercase text-xs tracking-widest active:scale-95 transition-all">Chơi lại</button>
              <button onClick={onBack} className="px-12 py-5 bg-gray-900 text-white rounded-[25px] font-black uppercase text-xs tracking-widest hover:bg-[#72C100] active:scale-95 transition-all">Xác nhận</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameMCQ;