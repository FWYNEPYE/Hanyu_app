import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiChevronLeft, HiOutlineLockClosed, HiOutlineCheckCircle, HiOutlineAcademicCap } from "react-icons/hi";
import axios from 'axios';

const RoadmapDetail = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [roadmapData, setRoadmapData] = useState(null);
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



    const handleOpenStep = (step, isTest = false) => {
    if (!isTest && step.status === 'locked') return; 
    
    if (isTest) {
        navigate(`/dashboard/final-test/${step.stepId}`, {  
            state: { 
                stepTitle: `Kiểm tra: ${step.title}`,
                roadmapId: id 
            }
        });
    } else {
        // Test theo từng bài học nhỏ
        navigate(`/dashboard/roadmap-step/${step.stepId}?roadmapId=${id}`, {
            state: { stepTitle: step.title } 
        });
    }
};

    const renderRoadmapSteps = () => {
        const elements = [];
        
        roadmapData.steps.forEach((step, index) => {
            // 1. Add Card bài học 
            elements.push(
            <div 
                key={`step-${step.stepId}`}
                className={`p-8 rounded-[40px] border-2 transition-all duration-500 bg-white flex flex-col justify-between
                ${step.status === 'locked' 
                    ? 'opacity-60 grayscale bg-gray-50 border-gray-100' 
                    : 'border-gray-50 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(255,65,108,0.15)] hover:-translate-y-2'}`}
            >
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white px-3 py-1 rounded-full w-fit">
                                    LEVEL {index + 1}
                                </span>
                                <span className="text-[10px] font-black text-red-500 ml-1 uppercase tracking-wider">
                                    {step.vocabCount || 0} từ vựng
                                </span>
                            </div>
                            {step.status === 'done' ? (
                                <HiOutlineCheckCircle size={32} className="text-emerald-500 animate-in zoom-in" />
                            ) : (
                                <HiOutlineLockClosed 
                                    size={26} 
                                    className={step.status === 'locked' ? "text-gray-300" : "text-orange-400"}
                                />
                            )}
                        </div>

                        <h4 className="text-2xl font-black text-gray-800 mb-3 uppercase leading-tight">
                            {step.title}
                        </h4>
                        <p className="text-gray-400 text-xs font-bold mb-8 h-12 line-clamp-2 leading-relaxed">
                            {step.description}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => handleOpenStep(step, false)}
                        className={`w-full py-5 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] transition-all
                        ${step.status === 'locked' 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-900 text-white hover:bg-red-600 shadow-xl active:scale-95'}`}
                    >
                        {step.status === 'locked' ? 'Nội dung bị khóa' : 'Bắt đầu học ngay'}
                    </button>
                </div>
            );

            // 2. Chèn bài TEST (LUÔN MỞ ĐỂ VƯỢT CẤP)
            const isTestLocked = false; 
                
            elements.push(
                <div 
                    key={`test-${index}`}
                    className="p-8 rounded-[40px] border-2 transition-all duration-500 flex flex-col justify-between bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 shadow-xl shadow-purple-500/10 hover:-translate-y-2"
                >
                    <div className="text-center">
                        <div className="inline-flex p-4 bg-white rounded-3xl shadow-sm mb-6">
                            <HiOutlineAcademicCap size={40} className="text-purple-600 animate-bounce" />
                        </div>
                        <h4 className="text-xl font-black uppercase mb-2 text-purple-900">
                           Test {step.title}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                            Thi ngay lập tức
                        </p>
                    </div>

                    <button 
                        onClick={() => handleOpenStep(step, true)}
                        className="w-full py-5 rounded-[25px] font-black uppercase text-[11px] tracking-[0.2em] transition-all bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200 active:scale-95"
                    >
                        Bắt đầu thi
                    </button>
                </div>
            );
        });

        return elements;
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center font-black animate-pulse text-red-500 tracking-widest uppercase text-xl">
                Đợi xíu...
            </div>
        </div>
    );

    if (!roadmapData) return (
        <div className="p-20 text-center text-red-500 font-black uppercase">
            Không tìm thấy lộ trình này!
        </div>
    );

    return (
        <div className="p-4 md:p-6 animate-in fade-in duration-700 bg-white min-h-screen">
            <div className="max-w-6xl mx-auto mb-12 text-center relative">
                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-full shadow-sm"
                >
                    <HiChevronLeft size={32} />
                </button>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-gray-900">
                    {roadmapData.title}
                </h3>
                <p className="text-gray-400 font-bold text-sm mt-3 tracking-tight max-w-2xl mx-auto">
                    {roadmapData.description}
                </p>
                <div className="h-[4px] w-24 bg-gradient-to-r from-red-600 to-pink-500 mx-auto mt-6 rounded-full shadow-sm"></div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {renderRoadmapSteps()}
            </div>
        </div>
    );
};

export default RoadmapDetail;