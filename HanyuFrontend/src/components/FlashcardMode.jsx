import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiOutlineMicrophone, HiOutlineVolumeUp, HiOutlineExclamationCircle } from "react-icons/hi";
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5252/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

export default function SRSPracticeSession({ onFinish }) {
  const [dueWords, setDueWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false); // State cho modal xác nhận
  const [failedIds, setFailedIds] = useState(new Set());

  useEffect(() => {
    const fetchSrsList = async () => {
      try {
        setLoading(true);
        const response = await api.get('/UserProgress/srs-list');
        const now = new Date();
        const dueOnly = response.data.filter(v => new Date(v.next) <= now);

        if (dueOnly.length > 0) {
          setDueWords(shuffle(dueOnly));
          setStep(dueOnly[0].isSentence ? 4 : 0);
        } else {
          onFinish(); 
        }
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSrsList();
  }, [onFinish]);


  //chặn reload
  useEffect(() => {
  const handleBeforeUnload = (e) => {
    e.preventDefault();
    e.returnValue = ""; 
  };

  const handleKeyDown = (e) => {
    if (
      e.keyCode === 116 || 
      (e.ctrlKey && e.keyCode === 82) || 
      (e.metaKey && e.keyCode === 82)
    ) {
      e.preventDefault();
      setShowExitConfirm(true); 
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);


  const word = dueWords[currentIdx];

  const shuffledOptions = useMemo(() => {
    if (!word) return [];
    const options = [word.meaning, "Tài liệu", "Giao tiếp", "Phát triển", "Hệ thống"];
    const filteredOptions = [word.meaning, ...shuffle(options.filter(o => o !== word.meaning)).slice(0, 2)];
    return shuffle(filteredOptions);
  }, [word?.vocaId, step]);

  const handleUpdateSRS = async (quality) => {
    try {
      await api.post('/UserProgress/update-review', {
        vocaId: word.vocaId,
        quality: quality
      });
    } catch (err) { console.error("Lỗi update:", err); }
  };

  const handleNext = async () => {
    const isLastStep = word.isSentence ? step === 5 : step === 3;
    if (isLastStep) {
      if (failedIds.has(word.vocaId)) {
        await handleUpdateSRS("hard");
        setDueWords(prev => [...prev, { ...word }]);
      } else {
        await handleUpdateSRS("normal");
      }
      
      if (currentIdx < dueWords.length - 1) {
        const nextWord = dueWords[currentIdx + 1];
        setCurrentIdx(currentIdx + 1);
        setStep(nextWord.isSentence ? 4 : 0);
        setStatus("idle");
        setSelected(null);
      } else {
        onFinish();
      }
    } else {
      setStep(step + 1);
      setStatus("idle");
      setSelected(null);
    }
  };

  const onChoiceClick = (opt) => {
    if (status !== "idle") return;
    setSelected(opt);
    if (opt === word.meaning) {
      setStatus("correct");
    } else {
      setStatus("wrong");
      setFailedIds(prev => new Set(prev).add(word.vocaId));
      setTimeout(() => { setStatus("idle"); setSelected(null); }, 1000);
    }
  };

  const progress = dueWords.length > 0 ? (currentIdx / dueWords.length) * 100 : 0;

  if (loading || !word) return <div className="text-center mt-20 font-bold text-slate-400">Đang tải dữ liệu...</div>;

  return (
    <div className="absolute inset-0 bg-white flex flex-col z-50 font-sans overflow-hidden">
{/* modal thoát */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowExitConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm z-[101] text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiOutlineExclamationCircle size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Thoát bây giờ?</h3>
              <p className="text-slate-500 font-medium mb-8">Tiến độ bài học này sẽ không được lưu lại đâu sếp ơi!</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onFinish} 
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black shadow-[0_4px_0_#be123c] active:translate-y-1 active:shadow-none transition-all"
                >
                  THOÁT LUÔN
                </button>
                <button 
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black hover:bg-slate-50 transition-all"
                >
                  HỌC TIẾP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="w-full px-6 py-4 flex items-center gap-4 border-b border-slate-50">
        <div className="flex-1 h-2.5 bg-slate-100 rounded-full relative overflow-hidden">
          <motion.div animate={{ width: `${progress}%` }} className="h-full bg-rose-500 rounded-full" />
        </div>
        <button 
          onClick={() => setShowExitConfirm(true)} 
          className="text-slate-300 hover:text-rose-500 transition-all p-1 hover:bg-rose-50 rounded-lg"
        >
          <HiX size={24} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center p-6 w-full max-w-md mx-auto overflow-y-auto">
        <h2 className="text-2xl font-black text-slate-400 mb-10 self-start tracking-tight uppercase text-sm">
          {step === 0 ? "Nghe và chọn nghĩa đúng" : step === 2 ? "Luyện phát âm" : "Chọn nghĩa đúng"}
        </h2>

        <div className="text-center mb-10">
          {step === 0 ? (
            <button onClick={() => {
              const msg = new SpeechSynthesisUtterance(word.word);
              msg.lang = 'zh-CN';
              window.speechSynthesis.speak(msg);
            }} className="w-17 h-17 bg-rose-400 text-white rounded-3xl shadow-lg flex items-center justify-center shadow-[0_6px_0_#0369a1]">
              <HiOutlineVolumeUp size={24} />
            </button>
          ) : (
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">{word.word}</h1>
          )}
          <p className="text-base font-bold text-rose-400 mt-4 tracking-widest ">/{word.pinyin}/</p>
        </div>

        {(step === 0 || step === 1 || step === 3) && (
          <div className="grid gap-3 w-full mt-4">
            {shuffledOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onChoiceClick(opt)}
                className={`p-5 border-2 rounded-2xl font-bold transition-all text-left text-lg
                  ${selected === opt && opt === word.meaning ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-[0_4px_0_#ea580c]' : 
                    selected === opt && status === 'wrong' ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-[0_4px_0_#e11d48]' :
                    'border-slate-200 hover:bg-slate-50 text-slate-600 shadow-[0_4px_0_#e2e8f0]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {(step === 2 || step === 5) && (
          <div className="flex flex-col items-center gap-6 mt-8">
            <button 
              onMouseDown={() => setIsRecording(true)} 
              onMouseUp={() => { setIsRecording(false); setStatus("correct"); }}
              className={`w-17 h-17 rounded-full flex items-center justify-center text-white transition-all shadow-2xl
                ${isRecording ? 'bg-orange-500 scale-110 shadow-orange-200' : 'bg-rose-500 shadow-rose-200'}`}
            >
              <HiOutlineMicrophone size={24} />
            </button>
            <p className="font-black text-slate-300 uppercase tracking-[0.2em] text-xs">Nhấn giữ để nói</p>
          </div>
        )}
      </main>

      <footer className={`p-8 border-t-2 transition-all duration-500 ${
  status === 'correct' 
    ? 'bg-rose-50 border-rose-200'
    : 'bg-white border-slate-50'    
}`}>
  <div className="max-w-md mx-auto flex justify-between items-center">
    {status === 'correct' ? (
      <>
        <div className="flex flex-col">
          <span className="text-rose-600 font-black text-2xl tracking-tight">
            Xuất sắc!
          </span>
        </div>
        
        <button 
          onClick={handleNext} 
          className="px-12 py-4 bg-orange-600 text-white rounded-2xl font-black shadow-[0_4px_0_#c2410c] hover:bg-orange-700 active:translate-y-1 active:shadow-none transition-all"
        >
          TIẾP TỤC
        </button>
      </>
    ) : (
      <div className="h-16 flex items-center"></div>
    )}
  </div>
</footer>
    </div>
  );
}