import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom'; 
import { HiChevronLeft, HiVolumeUp, HiSearch } from 'react-icons/hi';
import axios from 'axios';

const StepDetail = () => {
    const { stepId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const roadmapId = searchParams.get('roadmapId');

    const [vocabList, setVocabList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isError, setIsError] = useState(false); // State báo đỏ khi chưa thuộc hết
    const [title, setTitle] = useState(location.state?.stepTitle || "Nội dung bài học");

    useEffect(() => {
        const fetchVocab = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5252/api/Roadmap/step-vocab/${stepId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                setVocabList(response.data.vocabularies || response.data); 
                if(response.data.title) setTitle(response.data.title);
                
            } catch (error) {
                console.error("Lỗi lấy từ vựng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVocab();
    }, [stepId]);

    const handleToggleSRS = async (vocaId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            await axios.post(`http://localhost:5252/api/UserProgress/toggle-srs`, 
                { vocaId, userId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setVocabList(prev => prev.map(v => 
                v.vocaId === vocaId ? { ...v, isSaved: !currentStatus } : v
            ));
            // Nếu đang báo đỏ mà bấm thuộc thì tắt báo đỏ đi cho mượt
            setIsError(false);
        } catch (error) {
            console.error("Lỗi cập nhật SRS:", error);
        }
    };

    const handleFinishStep = async () => {
        // KIỂM TRA: Tất cả từ phải có isSaved = true
        const allLearned = vocabList.every(v => v.isSaved);

        if (!allLearned) {
            setIsError(true);
            // Tự động tắt báo đỏ sau 2 giây
            setTimeout(() => setIsError(false), 2000);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const allVocaIds = vocabList.map(v => v.vocaId);
            
            await axios.post(`http://localhost:5252/api/UserProgress/finish-step`, 
                { stepId, userId, vocaIds: allVocaIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate(`/dashboard/roadmap/${roadmapId}`);
        } catch (error) {
            console.error("Lỗi hoàn thành bài học:", error);
            navigate(`/dashboard/roadmap/${roadmapId}`);
        }
    };

    const playAudio = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
    };

    const filteredVocab = vocabList.filter(v => 
        v.hanzi.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 text-center font-black text-gray-400 animate-pulse uppercase">Đang tải...</div>;

    return (
        <div className="p-0 md:p-0 bg-[#f8fafc] min-h-screen">
            <div className="max-w-9xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-3rem)]">
                
                {/* --- PHẦN CỐ ĐỊNH (STICKY HEADER) --- */}
                <div className="sticky top-0 z-20 bg-white">
                    {/* Title & Search */}
                    <div className="p-1 md:p-4 border-b border-gray-50">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3 md:gap-4">
                                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                    <HiChevronLeft size={24} className="text-gray-600"/>
                                </button>
                                <h1 className="text-base md:text-xl font-black text-gray-800 uppercase line-clamp-1">{title}</h1>
                            </div>
                            <span className="hidden sm:inline text-sm font-bold text-gray-400">{vocabList.length} từ</span>
                        </div>

                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm từ..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Column Headers */}
                    <div className="grid grid-cols-12 px-6 md:px-8 py-4 bg-gray-50 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                        <div className="col-span-6 md:col-span-3">Từ vựng</div>
                        <div className="col-span-4 md:col-span-2">Nghĩa</div>
                        <div className="hidden md:block md:col-span-1">Loại</div>
                        <div className="hidden md:block md:col-span-5 px-4">Ví dụ minh họa</div>
                        <div className="col-span-2 md:col-span-1 text-right">Thuộc</div>
                    </div>
                </div>

                {/* --- PHẦN CUỘN (SCROLLABLE LIST) --- */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {filteredVocab.map((v) => (
                        <div key={v.vocaId} className="grid grid-cols-12 px-6 md:px-8 py-5 items-center hover:bg-emerald-50/30 transition-all group">
                            <div className="col-span-6 md:col-span-3 flex items-center gap-3 text-left">
                                <button onClick={() => playAudio(v.hanzi)} className="p-2 bg-sky-50 text-sky-500 rounded-lg hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                                    <HiVolumeUp size={16}/>
                                </button>
                                <div className="min-w-0">
                                    <div className="text-base md:text-lg font-black text-gray-800 leading-tight">{v.hanzi}</div>
                                    <div className="hidden md:block text-[13px] font-medium text-gray-400 ">/{v.pinyin}/</div>
                                </div>
                            </div>

                            <div className="col-span-4 md:col-span-2 text-left font-bold text-gray-700 text-sm md:text-base truncate pr-2">
                                {v.meaning}
                            </div>

                            <div className="hidden md:block md:col-span-1 text-left">
                                <span className="px-2 py-0.5 bg-gray-100 text-[9px] font-black text-gray-500 rounded uppercase border border-gray-200">
                                    {v.type || 'N'}
                                </span>
                            </div>

                            <div className="hidden md:block md:col-span-5 px-4 text-left">
                                <div className="text-base text-gray-600 font-medium line-clamp-1 ">"{v.example}"</div>
                                <div className="text-[13px] text-gray-400 mt-0.5">{v.exampleMeaning}</div>
                            </div>

                            <div className="col-span-2 md:col-span-1 flex justify-end">
                                <button 
                                    onClick={() => handleToggleSRS(v.vocaId, v.isSaved)}
                                    className={`w-10 h-5 md:w-11 md:h-5.5 rounded-full relative transition-all duration-300 shadow-inner ${
                                        v.isSaved ? 'bg-emerald-500 shadow-md shadow-emerald-100' : 'bg-gray-200'
                                    }`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
                                        v.isSaved ? 'left-5.5 md:left-6.5' : 'left-0.5'
                                    }`}></div>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- FOOTER --- */}
                <div className="p-2 md:p-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between bg-white">
                    <div className="mb-4 md:mb-0">
                        {isError && (
                            <p className="text-red-500 font-black text-[10px] uppercase tracking-widest animate-bounce">
                                ⚠️ Phải thuộc hết từ vựng.
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={handleFinishStep}
                        className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95
                        ${isError 
                            ? 'bg-red-600 text-white animate-shake' 
                            : 'bg-gray-900 text-white hover:bg-emerald-600'}`}
                    >
                        {isError ? 'Chưa thuộc hết từ!' : 'Hoàn thành bài học'}
                    </button>
                </div>
            </div>

            {/* CSS cho hiệu ứng rung (shake) khi lỗi */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    );
};

export default StepDetail;