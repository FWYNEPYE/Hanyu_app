import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    HiVolumeUp, HiChevronLeft, HiOutlineClock, 
    HiX, HiCheck, HiChevronRight 
} from "react-icons/hi";

const FinalTestSession = () => {
    const { stepId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(1);
    const [timeLeft, setTimeLeft] = useState(2400); // 40 phút mặc định
    const [answers, setAnswers] = useState({});

    const listeningIds = Array.from({ length: 20 }, (_, i) => i + 1);
    const readingIds = Array.from({ length: 20 }, (_, i) => i + 21);

    // 1. Tải đề thi từ AdminExamController
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token'); 
                const res = await axios.get(`/api/AdminExam/get-by-step/${stepId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data && res.data.questions) {
                    if(res.data.timeLimit) setTimeLeft(res.data.timeLimit * 60); 
                    setQuestions(res.data.questions); 
                }
                setLoading(false);
            } catch (error) {
                console.error("Lỗi khi tải câu hỏi:", error);
                alert("Step này chưa được cấu hình đề thi!");
                setLoading(false);
            }
        };
        if (stepId) fetchQuestions();
    }, [stepId]);

    // Đếm ngược thời gian
    useEffect(() => {
        if (timeLeft <= 0) {
            alert("Hết giờ làm bài rồi!");
            handleSubmit();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // 2. Xử lý nộp bài
    const handleSubmit = async () => {
        const confirmSubmit = window.confirm("Có chắc chắn muốn nộp bài thi không?");
        if (!confirmSubmit) return;

        try {
            const token = localStorage.getItem('token'); 
            const formattedAnswers = Object.keys(answers).map(key => ({
                questionId: questions[parseInt(key) - 1]?.id, 
                userAnswer: answers[key]
            }));

            const res = await axios.post(`/api/Test/submit`, {
                stepId: parseInt(stepId),
                answers: formattedAnswers,
                timeUsed: (questions.length > 0 ? 2400 : 0) - timeLeft
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Nộp bài thành công! Điểm: ${res.data.score}. ${res.data.message}`);
            navigate(`/roadmap`); // Hoặc trang kết quả 
        } catch (error) {
            console.error("Lỗi nộp bài:", error);
            alert("Lỗi khi nộp bài!");
        }
    };

    const currentQuestion = questions[activeId - 1];

    // --- LOGIC RENDER NỘI DUNG TỪNG PHẦN ---
    const renderQuestionContent = () => {
        if (loading || !currentQuestion) {
            return <div className="animate-pulse text-slate-300">Đang tải câu hỏi...</div>;
        }

        // A. PHẦN NGHE HIỂU (1-20)
        if (activeId <= 20) {
            return (
                <div className="flex flex-col items-center w-full space-y-6">
                    <AudioControl audioUrl={currentQuestion.audioUrl} />
                    
                    {/* Nghe 1-5: Đúng/Sai */}
                    {activeId <= 5 && (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="text-center">
                                <p className="text-slate-400 text-xs italic">{currentQuestion.pinyin}</p>
                                <h2 className="text-3xl font-bold text-slate-800">{currentQuestion.content}</h2>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <SelectionBtn active={answers[activeId] === "True"} onClick={() => setAnswers({...answers, [activeId]: "True"})} type="check" />
                                <SelectionBtn active={answers[activeId] === "False"} onClick={() => setAnswers({...answers, [activeId]: "False"})} type="cross" />
                            </div>
                        </div>
                    )}
                
                    {/* Nghe 6-10: Chọn đáp án A, B, C dựa trên ảnh */}
                    {activeId >= 6 && activeId <= 10 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
                            {currentQuestion.options?.map((opt, idx) => (
                                <OptionButton key={idx} idx={idx} opt={opt} activeId={activeId} answers={answers} setAnswers={setAnswers} />
                            ))}
                        </div>
                    )}

                    {/* Nghe 11-20: Nối/Chọn text */}
                    {activeId >= 11 && activeId <= 20 && (
                        <div className="w-full max-w-lg space-y-6 text-center">
                            {activeId <= 15 && currentQuestion.referenceImages && <ReferenceImages images={currentQuestion.referenceImages} />}
                            <div className={`grid ${activeId >= 16 ? 'grid-cols-1 gap-3' : 'grid-cols-5 gap-2'}`}>
                                {(activeId <= 15 ? ['A', 'B', 'C', 'D', 'E'] : currentQuestion.options).map((opt, i) => (
                                    <OptionButton key={i} idx={i} opt={opt} activeId={activeId} answers={answers} setAnswers={setAnswers} layout={activeId >= 16 ? "full" : "mini"} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }


// Dạng 1: Câu 21 - 25 (Hoặc bài Test tự động từ từ vựng)
if (activeId >= 21 && activeId <= 25 || !currentQuestion.referenceImages) { 
    return (
        <div className="flex flex-col items-center w-full space-y-6">
            {currentQuestion.imageUrl && (
                <div className="w-full max-w-[240px] aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                    <img 
                        src={currentQuestion.imageUrl.startsWith('http') ? currentQuestion.imageUrl : `http://localhost:5252${currentQuestion.imageUrl}`} 
                        className="w-full h-full object-cover"
                        alt="vocab"
                    />
                </div>
            )}

            <div className="text-center">
                <h2 className="text-6xl font-bold text-slate-800 mb-2 tracking-tight">
                    {currentQuestion.content}
                </h2>
                <p className="text-slate-400 text-lg italic">{currentQuestion.pinyin}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                {currentQuestion.options?.map((opt, idx) => (
                    <OptionButton key={idx} idx={idx} opt={opt} activeId={activeId} answers={answers} setAnswers={setAnswers} />
                ))}
            </div>
        </div>
    );
}


// Dạng: Câu 26 - 30 (Loạt ảnh ở trên, câu mô tả ở dưới)
if (activeId >= 26 && activeId <= 30) {
    const question26 = questions.find(q => questions.indexOf(q) === 25); 
    const sharedImages = currentQuestion.referenceImages?.length > 0 
                         ? currentQuestion.referenceImages 
                         : question26?.referenceImages;

    return (
        <div className="flex flex-col items-center w-full space-y-6">
            {/*  Hiển thị bộ ảnh tham chiếu */}
            {sharedImages && sharedImages.length > 0 ? (
                <ReferenceImages images={sharedImages} />
            ) : (
                <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                    Sếp chưa nhập bộ ảnh cho câu 26 rồi!
                </div>
            )}
            
            <div className="text-center p-8 bg-white rounded-[32px] w-full border-2 border-slate-100 shadow-sm">
                <p className="text-4xl font-bold text-slate-800 italic">
                    "{currentQuestion.content}"
                </p>
                {currentQuestion.pinyin && (
                    <p className="text-slate-400 mt-2">{currentQuestion.pinyin}</p>
                )}
            </div>

            {/*  Dãy nút A, B, C, D, E  */}
            <div className="flex justify-center gap-4 w-full">
                {['A', 'B', 'C', 'D', 'E'].map((label, i) => (
                    <OptionButton 
                        key={i} idx={i} opt={label} 
                        activeId={activeId} answers={answers} 
                        setAnswers={setAnswers} layout="mini" 
                    />
                ))}
            </div>
        </div>
    );
}

        // Dạng 3: Câu 31 - 35 (Câu hỏi ở trên -> Chọn đáp án trả lời đúng A, B, C ở dưới)
        if (activeId >= 31 && activeId <= 35) {
            return (
                <div className="flex flex-col items-center w-full space-y-6">
                    <div className="bg-blue-50 p-8 rounded-[32px] w-full border border-blue-100 text-center shadow-sm">
                        <h3 className="text-2xl font-bold text-blue-900 leading-snug">
                            {currentQuestion.content}
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                        {currentQuestion.options?.map((opt, idx) => (
                            <OptionButton key={idx} idx={idx} opt={opt} activeId={activeId} answers={answers} setAnswers={setAnswers} />
                        ))}
                    </div>
                </div>
            );
        }

        // Dạng 4: Câu 36 - 40 (Điền từ vào chỗ trống)
        if (activeId >= 36 && activeId <= 40) {
            return (
                <div className="flex flex-col items-center w-full space-y-6">
                    {/* Ô chứa các từ gợi ý (Word Bank) */}
                    <div className="grid grid-cols-5 gap-2 w-full bg-orange-50 p-5 rounded-2xl border border-orange-100">
                        {currentQuestion.wordBank?.map((word, i) => (
                            <div key={i} className="text-center border-r last:border-none border-orange-200">
                                <span className="text-[10px] block text-orange-400 font-black uppercase">
                                    {String.fromCharCode(65+i)}
                                </span>
                                <span className="font-bold text-slate-700 text-lg">{word}</span>
                            </div>
                        ))}
                    </div>

                    {/* Câu văn có chỗ trống */}
                    <div className="text-center px-4 py-6">
                        <h2 className="text-3xl font-bold text-slate-800 leading-relaxed">
                            {currentQuestion.content}
                        </h2>
                    </div>

                    {/* Nút chọn A, B, C, D, E để điền */}
                    <div className="grid grid-cols-5 gap-2 w-full max-w-md">
                        {['A', 'B', 'C', 'D', 'E'].map((label, i) => (
                            <OptionButton key={i} idx={i} opt={label} activeId={activeId} answers={answers} setAnswers={setAnswers} layout="mini" />
                        ))}
                    </div>
                </div>
            );
        }
    }
    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="flex h-screen bg-[#FAFAFA] text-slate-900 overflow-hidden font-sans">
            <aside className="hidden lg:flex flex-col w-[240px] bg-white border-r border-slate-100 shadow-sm">
                <div className="p-6 border-b border-slate-50"><span className="text-xs font-black tracking-widest text-slate-800 uppercase">HSK 1 - Final Test</span></div>
                <div className="flex-1 px-4 overflow-y-auto space-y-8 py-6 scrollbar-hide">
                    <StatusGrid title="Phần nghe hiểu" range={listeningIds} activeId={activeId} answers={answers} onClick={setActiveId} />
                    <StatusGrid title="Phần đọc hiểu" range={readingIds} activeId={activeId} answers={answers} onClick={setActiveId} />
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-black text-slate-900">CÂU {activeId}</span>
                        <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-sm border ${timeLeft < 300 ? 'bg-rose-50 border-rose-200 text-rose-500 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                            <HiOutlineClock className="inline mr-1 mb-0.5" />{formatTime(timeLeft)}
                        </div>
                    </div>
                    <button onClick={handleSubmit} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Nộp bài</button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-12">
                    <div className="max-w-3xl mx-auto">
                        <div className="w-full min-h-[450px] flex flex-col bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 text-9xl font-black text-slate-50/40 select-none">HSK</div>
                            <div className="flex-1 flex items-center justify-center w-full z-10">{renderQuestionContent()}</div>
                            
                            <footer className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-center w-full z-10">
                                <button disabled={activeId === 1} onClick={() => setActiveId(activeId - 1)} className="px-4 py-2 font-black text-slate-400 hover:text-slate-900 disabled:opacity-20 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                    <HiChevronLeft size={20}/> Câu trước
                                </button>
                                {activeId < 40 ? (
                                    <button onClick={() => setActiveId(activeId + 1)} className="bg-white border-2 border-slate-900 text-slate-900 px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all">
                                        Câu sau <HiChevronRight size={20}/>
                                    </button>
                                ) : (
                                    <button onClick={handleSubmit} className="bg-rose-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-200">
                                        Hoàn thành <HiCheck size={20}/>
                                    </button>
                                )}
                            </footer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const OptionButton = ({ idx, opt, activeId, answers, setAnswers, layout = "full" }) => {
    const label = String.fromCharCode(65 + idx);
    const isSelected = answers[activeId] === opt;
    
    // Nút nhỏ (dành cho chọn A, B, C, D, E)
    if (layout === "mini") {
        return (
            <button 
                onClick={() => setAnswers({...answers, [activeId]: opt})}
                className={`w-12 h-12 rounded-xl font-bold border-2 transition-all flex items-center justify-center
                    ${isSelected ? 'border-slate-800 bg-slate-900 text-white shadow-md' : 'border-slate-100 text-slate-400 bg-white hover:border-slate-200'}`}
            >
                {opt}
            </button>
        );
    }

    // Nút dài (dành cho chọn nghĩa Tiếng Việt)
    return (
        <button 
            onClick={() => setAnswers({...answers, [activeId]: opt})}
            className={`w-full py-4 px-6 rounded-2xl font-bold border-2 transition-all flex justify-between items-center text-left
                ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 text-slate-600 bg-white hover:bg-slate-50'}`}
        >
            <span className="text-lg">{label}. {opt}</span>
            {isSelected ? <HiCheck className="text-blue-600" size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"></div>}
        </button>
    );
};
const AudioControl = ({ audioUrl }) => {
    const playAudio = () => {
        if (audioUrl) {
            const baseServer = "http://localhost:5252";
            const fullUrl = audioUrl.startsWith('http') ? audioUrl : `${baseServer}${audioUrl}`;
            new Audio(fullUrl).play().catch(e => console.error("Lỗi âm thanh:", e));
        } else {
            alert("Câu này chưa có âm thanh!");
        }
    };
    return (
        <button onClick={playAudio} className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all">
            <HiVolumeUp size={32} />
        </button>
    );
};

const SelectionBtn = ({ active, onClick, type }) => (
    <button onClick={onClick} className={`w-16 h-16 rounded-[24px] border flex items-center justify-center transition-all shadow-sm active:scale-95
        ${active ? (type === 'check' ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-100' : 'bg-rose-500 border-rose-500 text-white shadow-rose-100') 
                 : 'bg-white text-slate-200 border-slate-100 hover:border-slate-200'}`}>
        {type === 'check' ? <HiCheck size={32} /> : <HiX size={32} />}
    </button>
);

const StatusGrid = ({ title, range, activeId, answers, onClick }) => (
    <section>
        <h5 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4 px-1">{title}</h5>
        <div className="grid grid-cols-5 gap-2">
            {range.map(id => (
                <button key={id} onClick={() => onClick(id)}
                    className={`aspect-square rounded-xl font-bold text-[10px] transition-all border
                    ${activeId === id ? 'border-blue-500 bg-blue-50 text-blue-600 scale-110 z-10 shadow-md' : 
                      answers[id] ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-50 text-slate-300 hover:border-slate-100'}`}>
                    {id}
                </button>
            ))}
        </div>
    </section>
);

const ReferenceImages = ({ images }) => (
    <div className="grid grid-cols-5 gap-3 w-full mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        {images.map((img, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
                <div className="aspect-square w-full overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-black text-slate-400">{img.label}</span>
            </div>
        ))}
    </div>
);

export default FinalTestSession;