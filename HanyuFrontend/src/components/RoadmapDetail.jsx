import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiChevronLeft, HiOutlineLockClosed, HiOutlineCheckCircle, HiVolumeUp, HiX, HiOutlineCollection } from "react-icons/hi";
import axios from 'axios';

const RoadmapDetail = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [roadmapData, setRoadmapData] = useState(null);
    const [vocabList, setVocabList] = useState([]);
    const [selectedStep, setSelectedStep] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token'); 
                const response = await axios.get(`http://localhost:5252/api/Roadmap/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRoadmapData(response.data);
            } catch (error) {
                console.error("Lỗi lấy lộ trình:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoadmap();
    }, [id]);

    const handleOpenStep = async (step) => {
        if (step.status === 'locked') return; 

        try {
            // Gọi API lấy list từ vựng của bộ này (VD: list từ của HSK 1)
            const response = await axios.get(`http://localhost:5252/api/Roadmap/step-vocab/${step.stepId}`);
            setVocabList(response.data);
            setSelectedStep(step);
        } catch (error) {
            console.error("Lỗi lấy từ vựng:", error);
        }
    };

    const handleComplete = async () => {
        try {
            await axios.post(`http://localhost:5252/api/Roadmap/complete-step/${selectedStep.stepId}`);
            setSelectedStep(null);
            window.location.reload(); 
        } catch (error) {
            console.error("Lỗi lưu tiến độ:", error);
        }
    };

    const playAudio = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse">ĐANG TẢI...</div>;
    if (!roadmapData) return <div className="p-20 text-center text-red-500 font-black">KHÔNG TÌM THẤY LỘ TRÌNH NÀY!</div>;

    return (
        <div className="p-4 md:p-6 animate-in fade-in duration-700">
            {/* Header - Giữ nguyên form sếp gửi */}
            <div className="max-w-6xl mx-auto mb-10 text-center relative">
                <button onClick={() => navigate(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors">
                    <HiChevronLeft size={32} />
                </button>
                <h3 className="text-3xl font-black uppercase tracking-tighter italic">
                    {roadmapData.title}
                </h3>
                <p className="text-gray-400 font-bold text-sm mt-2">{roadmapData.description}</p>
                <div className="h-[2px] w-20 bg-red-600 mx-auto mt-4"></div>
            </div>

            {/* Steps Grid - Form Card 40px của sếp */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {roadmapData.steps.map((step, index) => (
                    <div 
                        key={step.stepId}
                        className={`p-8 rounded-[40px] border-2 transition-all duration-500 bg-white shadow-sm
                        ${step.status === 'locked' ? 'opacity-60 grayscale' : 'border-gray-100 hover:shadow-2xl hover:-translate-y-2'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full w-fit">
                                    Cấp độ {index + 1}
                                </span>
                                <span className="text-[9px] font-bold text-red-500 ml-1 uppercase">{step.vocabCount || 0} từ vựng</span>
                            </div>
                            {step.status === 'done' ? (
                                <HiOutlineCheckCircle size={28} className="text-emerald-500"/>
                            ) : (
                                <HiOutlineLockClosed size={24} className={step.status === 'locked' ? "text-gray-300" : "text-orange-400"}/>
                            )}
                        </div>

                        <h4 className="text-2xl font-black text-gray-800 mb-3 uppercase leading-tight">{step.title}</h4>
                        <p className="text-gray-400 text-xs font-bold mb-8 h-10 line-clamp-2 leading-relaxed">{step.description}</p>
                        
                        <button 
                            onClick={() => handleOpenStep(step)}
                            className={`w-full py-5 rounded-[25px] font-black uppercase text-[11px] tracking-widest transition-all
                            ${step.status === 'locked' 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-gray-900 text-white hover:bg-red-600 shadow-xl active:scale-95'}`}
                        >
                            {step.status === 'locked' ? 'Nội dung bị khóa' : 'Khám phá bộ từ'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal Flashcard - Form sếp gửi */}
            {selectedStep && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[40px] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
                            <div>
                                <h2 className="font-black uppercase italic tracking-widest text-xl">{selectedStep.title}</h2>
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">Danh sách từ vựng chi tiết</p>
                            </div>
                            <button onClick={() => setSelectedStep(null)} className="hover:rotate-90 transition-transform p-2 bg-white/10 rounded-xl">
                                <HiX size={24}/>
                            </button>
                        </div>
                        
                        {/* Modal Content - List từ vựng */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50">
                            {vocabList.map((voca) => (
                                <div key={voca.vocaId} className="bg-white p-6 rounded-[30px] border border-gray-100 flex items-center justify-between hover:border-red-500 transition-all shadow-sm group">
                                    <div className="flex items-center gap-5">
                                        <div className="text-3xl font-black text-gray-900 group-hover:scale-110 transition-transform">{voca.hanzi}</div>
                                        <div className="h-10 w-[1px] bg-gray-100 mx-2"></div>
                                        <div>
                                            <p className="text-xs font-black text-red-500 tracking-tighter uppercase">{voca.pinyin}</p>
                                            <p className="text-sm font-bold text-gray-800">{voca.meaning}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => playAudio(voca.hanzi)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <HiVolumeUp size={22}/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-white border-t flex justify-end gap-4">
                            <button onClick={() => setSelectedStep(null)} className="px-8 py-4 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600 transition-all">
                                Đóng
                            </button>
                            <button 
                                onClick={handleComplete} 
                                className="px-12 py-4 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-[20px] hover:bg-gray-900 transition-all shadow-xl active:scale-95"
                            >
                                Xác nhận hoàn thành bộ từ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadmapDetail;