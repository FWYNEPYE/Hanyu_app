import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IoAddCircleOutline, 
    IoTrashOutline, 
    IoVolumeHighOutline ,IoCloseOutline, 
    IoFolderOpenOutline, IoLogoYoutube,    
    IoCloudUploadOutline
} from "react-icons/io5";
import { HiChevronLeft } from "react-icons/hi";
import YouTube from 'react-youtube';
import axios from 'axios';

const BASE_URL = 'http://localhost:5252/api/Videos';

const VideoLearning = () => {
    
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        // lấy User ID từ localStorage
        const storedId = localStorage.getItem('userId');
        
        if (storedId) {
            console.log("✅ Đã tìm thấy User ID từ localStorage:", storedId);
            setCurrentUserId(parseInt(storedId));
        } else {
            console.error("❌ Không tìm thấy key 'userId' trong localStorage!");
        }
    }, []);



    const [videos, setVideos] = useState([]);
    const [subtitles, setSubtitles] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAISubsActive, setIsAISubsActive] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const [isSelectingGroup, setIsSelectingGroup] = useState(false);
    const [vocabGroups, setVocabGroups] = useState([]); 
    const [newGroupName, setNewGroupName] = useState("");


    const [addTab, setAddTab] = useState('youtube'); 
    const [selectedFile, setSelectedFile] = useState(null);


    const [deletingVideo, setDeletingVideo] = useState(null); 
    const [showPinyin, setShowPinyin] = useState(true);
    const [showMean, setShowMean] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [player, setPlayer] = useState(null);
    const activeSubRef = useRef(null);
    const [activeWord, setActiveWord] = useState(null);
    const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });

    const [newTitle, setNewTitle] = useState("");
    const [newUrl, setNewUrl] = useState("");


    const getYoutubeId = (url) => {
        if (!url) return "";
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7]) ? match[7].substring(0, 11) : (url.length === 11 ? url : "");
    };

    const getYouTubeThumbnail = (url) => {
        const id = getYoutubeId(url);
        return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : ""; 
    };

const fetchVideos = async () => {
    // Chỉ gọi API nếu đã có currentUserId
    if (!currentUserId) return;

    try {
        // Truyền UserID lên Backend (phù hợp với hàm GetVideos ở Backend)
        const res = await axios.get(`${BASE_URL}?userId=${currentUserId}`);
        
        // Xử lý dữ liệu trả về (hỗ trợ cả dạng mảng thường và mảng bọc trong $values của JSON.NET)
        if (Array.isArray(res.data)) {
            setVideos(res.data);
        } else if (res.data?.$values) {
            setVideos(res.data.$values);
        }
    } catch (err) { 
        console.error("Lỗi lấy danh sách video cá nhân:", err); 
    }
};


    const fetchVideoDetail = async () => {
    if (!selectedVideo) return;
    const id = selectedVideo.videoId || selectedVideo.id; 
    
    try {
        if (!selectedVideo.subtitles) setIsLoading(true);

        const res = await axios.get(`${BASE_URL}/${id}`);
        const dbSubs = res.data.subtitles || res.data.Subtitles || res.data.$values || [];

        const formatted = (Array.isArray(dbSubs) ? dbSubs : (dbSubs.$values || [])).map(s => {
            let rawTokens = s.tokens || s.Tokens || s.tokens?.$values || [];
            let processedTokens = [];

            if (typeof rawTokens === 'string') {
                try { processedTokens = JSON.parse(rawTokens); } catch { processedTokens = []; }
            } else {
                processedTokens = Array.isArray(rawTokens) ? rawTokens : (rawTokens.$values || []);
            }

            const finalizedTokens = processedTokens.map(t => ({
                pinyin: t.pinyin || t.Pinyin || "",
                char: t.char || t.Char || t.text || t.Text || "" ,
                mean: t.mean || t.Mean || t.vi || "...",
                // BỔ SUNG: Lấy loại từ và ghi chú từ dữ liệu AI
                type: t.type || t.Type || "từ",
                note: t.note || t.Note || "" 
            }));

            return {
                text: s.content || s.Content,
                startTime: s.startTime || s.StartTime,
                endTime: s.endTime || s.EndTime,
                pinyin: s.pinyin || s.Pinyin,
                vi: s.vi || s.translation || s.Translation || "Chưa có dịch", 
                tokens: finalizedTokens 
            };
        });

        setSubtitles(formatted);
        setIsAISubsActive(formatted.length > 0);
    } catch (err) {
        console.error("Lỗi fetch detail:", err);
    } finally {
        setIsLoading(false);
    }
};
    useEffect(() => { fetchVideoDetail(); }, [selectedVideo]);



useEffect(() => {
    if (currentUserId) {
        console.log("🚀 Khởi tạo dữ liệu cho User:", currentUserId);
        fetchVideos();
        fetchVocabGroups();
    }
}, [currentUserId]); // Chạy lại mỗi khi currentUserId thay đổi (từ null thành có giá trị)

       

 

    const fetchVocabGroups = async () => {
        if (!currentUserId) return;

        try {
            // API sẽ gọi: http://localhost:5252/api/Category/user/7
            const res = await axios.get(`http://localhost:5252/api/Category/user/${currentUserId}`); 
            
            console.log("Dữ liệu trả về:", res.data);

        
            if (res.data && Array.isArray(res.data)) {
                setVocabGroups(res.data);
            } else if (res.data?.$values) {
                setVocabGroups(res.data.$values);
            }
        } catch (err) { 
            console.error("Lỗi lấy bộ từ:", err); 
            setVocabGroups([]);
        }
    };



    // Tạo bộ từ mới
    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || !currentUserId) return;
        try {
            const res = await axios.post(`http://localhost:5252/api/Category`, { 
                categoryName: newGroupName,
                userID: parseInt(currentUserId), 
                categoryType: "user"
            });
            fetchVocabGroups(); 
            setNewGroupName("");
        } catch (err) { console.error("Lỗi tạo bộ từ:", err); }
    };


    // Lưu từ vựng
 const saveWordToGroup = async (groupId) => {
    if (!activeWord || !currentUserId) return;

    try {
        const payload = {
            hanzi: activeWord.char || activeWord.text,
            pinyin: activeWord.pinyin,
            meaning: activeWord.mean || activeWord.vi || "Chưa có nghĩa",
            // SỬA: Lấy loại từ thực tế từ AI thay vì "Video_Learning"
            type: activeWord.type || "Từ vựng", 
            level: 1, 
            categoryID: groupId,
            // SỬA: Lưu ghi chú giải thích ngữ cảnh của AI vào phần note
            note: activeWord.note || "Lưu từ video"
        };

        const res = await axios.post(`http://localhost:5252/api/Vocabulary`, payload);
        
        if (res.status === 200 || res.status === 201) {
            setActiveWord(null);
            setIsSelectingGroup(false);
        }
    } catch (err) { 
        console.error("Lỗi từ Server:", err.response?.data);
        alert("Không thể lưu từ!"); 
    }
};

    

    useEffect(() => {
        let interval;
        if (player) {
            interval = setInterval(() => setCurrentTime(player.getCurrentTime()), 300);
        }
        return () => clearInterval(interval);
    }, [player]);

    useEffect(() => {
        if (activeSubRef.current) {
            activeSubRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentTime]);

    const handleAIAnalyze = async () => {
    if (isLoading) return;
    const id = selectedVideo?.videoId || selectedVideo?.id;
    setIsLoading(true);
    try {
        await axios.post(`${BASE_URL}/${id}/auto-generate-sub`, {}, {
            // Tăng timeout lên 10 phút (600,000ms) vì AI xử lý rất lâu
            timeout: 600000 
        });
        await fetchVideoDetail(); 
    } catch (err) {
        console.error("Chi tiết lỗi AI:", err.response?.data);
        alert("Lỗi khi phân tích AI! Kiểm tra Log Backend để biết chi tiết.");
    } finally {
        setIsLoading(false);
    }
};

    const speakChinese = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    };

    const handleWordClick = (e, token) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setPopoverPos({ 
            x: rect.left + rect.width / 2, 
            y: rect.top 
        });
        setActiveWord(token);
    };



    const handleFinalDelete = async () => {
        if (!deletingVideo) return;
        try {
            const id = deletingVideo.videoId || deletingVideo.id;
            await axios.delete(`${BASE_URL}/${id}`);
            setDeletingVideo(null);
            fetchVideos();
        } catch (err) { alert("Lỗi khi xóa video!"); }
    };


 

    const handleUpload = async () => {
    if (!newTitle) return alert("Vui lòng nhập tiêu đề!");
    if (addTab === 'youtube' && !newUrl) return alert("Vui lòng dán link YouTube!");
    if (addTab === 'local' && !selectedFile) return alert("Vui lòng chọn file video!");
    if (!currentUserId) return alert("Lỗi: Không xác định được người dùng!");

    try {
        const formData = new FormData();
        formData.append("Title", newTitle);
        formData.append("VideoType", addTab);
        // QUAN TRỌNG: Gửi UserID để lưu vào DB
        formData.append("UserID", currentUserId); 

        if (addTab === 'youtube') {
            formData.append("UrlOrPath", newUrl);
        } else {
            formData.append("File", selectedFile);
        }

        await axios.post(`${BASE_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Reset và load lại
        setIsAddModalOpen(false);
        setNewTitle(""); 
        setNewUrl("");
        setSelectedFile(null);
        fetchVideos(); // Load lại danh sách sau khi thêm
        
    } catch (err) { 
        console.error(err);
        alert("Lỗi khi thêm video!"); 
    }
};

    return (
        <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {!selectedVideo ? (
                    <>
                        <header className="flex justify-between items-center mb-12">
                            {/* <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Hanyu Learning</h1> */}
                            <p></p>
                            <button onClick={() => setIsAddModalOpen(true)} className="bg-[#e5535a] text-white px-6 py-3 rounded-2xl text-[10px] font-black shadow-lg hover:bg-blue-700 transition-colors">
                                + THÊM VIDEO MỚI
                            </button>
                        </header>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {videos.map((v) => (
                                <div key={v.videoId || v.id} className="relative group">
                                    <div onClick={() => setSelectedVideo(v)} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl cursor-pointer transition-all border border-white hover:border-orange-200">
                                        <div className="relative overflow-hidden">
                                            <img src={getYouTubeThumbnail(v.urlOrPath)} className="w-full aspect-video object-cover" alt={v.title} />
                                        </div>
                                        <div className="p-5 font-bold text-center text-slate-700 uppercase text-[11px]">{v.title}</div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setDeletingVideo(v); }} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                        <IoTrashOutline size={18}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => {setSelectedVideo(null); setIsAISubsActive(false)}} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors">
                                <HiChevronLeft size={24}/> 
                            </button>
                            {isAISubsActive && (
                                <div className="flex gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                                    <button onClick={() => setShowPinyin(!showPinyin)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${showPinyin ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>PINYIN</button>
                                    <button onClick={() => setShowMean(!showMean)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${showMean ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>NGHĨA</button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className={isAISubsActive ? "lg:col-span-7" : "lg:col-span-12"}>
                                <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl">
                                    <YouTube 
                                        videoId={getYoutubeId(selectedVideo.urlOrPath)} 
                                        onReady={(e) => setPlayer(e.target)}
                                        opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1, enablejsapi: 1, origin: 'http://localhost:5173' } }} 
                                        className="w-full h-full"
                                    />
                                </div>
                                {!isAISubsActive && !isLoading && (
                                    <div className="mt-8 text-center p-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <button onClick={handleAIAnalyze} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all">BẮT ĐẦU PHÂN TÍCH AI</button>
                                    </div>
                                )}
                                {isLoading && <p className="mt-8 text-center font-black text-slate-400 animate-pulse tracking-widest text-xs uppercase">AI IS ANALYZING...</p>}
                            </div>

                            {isAISubsActive && (
                                <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-6 h-[600px] overflow-y-auto shadow-inner border border-slate-200 scroll-smooth scroll-pt-10">
                                    <div className="space-y-6">
                                        {subtitles.map((sub, i) => {
                                            const isActive = currentTime >= sub.startTime && currentTime <= sub.endTime;
                                            return (
                                                <div key={i} ref={isActive ? activeSubRef : null} onClick={() => player.seekTo(sub.startTime)}
                                                    className={`p-6 rounded-[2rem] transition-all duration-300 border-2 cursor-pointer ${isActive ? 'bg-blue-50 border-blue-400 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                                                    <div className="flex flex-wrap gap-x-2 gap-y-3">
                                                        {sub.tokens?.map((t, ti) => (
    <div key={ti} className="flex flex-col items-center hover:bg-blue-100 rounded-lg p-1 transition-all" onClick={(e) => handleWordClick(e, t)}>
        {/* Chỉ cần dùng t.pinyin và t.char vì đã chuẩn hóa ở bước fetch */}
        {showPinyin && <p className="text-[13px] text-blue-500 font-black">{t.pinyin}</p>}
        <p className="text-2xl font-medium text-slate-800">{t.char}</p>
    </div>
))}
                                                    </div>
                                                    {showMean && <p className="mt-4 text-slate-400  text-base font-medium border-t pt-3">{sub.vi}</p>}
                                                </div>
                                            );
                                        })}
                                        <div className="h-[400px]"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS & POPOVERS */}
            <AnimatePresence>
               {isAddModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/*  blur cam hồng các thứ*/}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddModalOpen(false)} 
                        className="absolute inset-0  backdrop-blur-md" 
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative z-[210] shadow-[0_20px_50px_rgba(255,71,121,0.2)] border border-rose-50"
                    >
                        {/* <h2 className="text-sm font-black text-rose-600 uppercase tracking-[0.2em] mb-6 text-center">
                        Thêm bài học mới
                        </h2> */}

                        <div className="flex bg-rose-50/50 p-1.5 rounded-2xl mb-6">
                        <button 
                            onClick={() => setAddTab('youtube')} 
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 ${addTab === 'youtube' ? 'bg-white shadow-md text-orange-500' : 'text-rose-300 hover:text-rose-400'}`}
                        >
                            <IoLogoYoutube size={14}/> YouTube
                        </button>
                        <button 
                            onClick={() => setAddTab('local')} 
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 ${addTab === 'local' ? 'bg-white shadow-md text-orange-500' : 'text-rose-300 hover:text-rose-400'}`}
                        >
                            <IoCloudUploadOutline size={14}/> Thiết bị
                        </button>
                        </div>

                        <div className="space-y-4">
                        {/* Input Tiêu đề */}
                        <div className="group">
                            <input 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            type="text" 
                            placeholder="Đặt tên cho video..." 
                            className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-orange-300 focus:bg-white transition-all placeholder:text-rose-200 text-rose-700" 
                            />
                        </div>

                        {addTab === 'youtube' ? (
                            /* Tab YouTube */
                            <motion.input 
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            type="text" 
                            placeholder="Dán link YouTube vào đây..." 
                            className="w-full bg-rose-50/30 border border-rose-100 rounded-2xl px-5 py-4 text-xs outline-none focus:border-rose-300 focus:bg-white transition-all placeholder:text-rose-200 text-rose-700 font-medium" 
                            />
                        ) : (
                            /* Tab Local (Tải lên từ thiết bị) */
                            <motion.div 
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="relative"
                            >
                            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-rose-100 rounded-[2rem] cursor-pointer bg-rose-50/20 hover:bg-rose-50 hover:border-rose-300 transition-all group overflow-hidden">
                                <div className="flex flex-col items-center justify-center px-4 text-center">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <IoCloudUploadOutline className="text-xl text-orange-400" />
                                </div>
                                <p className="text-[10px] font-black text-rose-300 uppercase tracking-tighter group-hover:text-rose-500">
                                    {selectedFile ? selectedFile.name : "Chọn video"}
                                </p>
                                </div>
                                <input 
                                type="file" 
                                className="hidden" 
                                accept="video/*" 
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                            </label>
                            </motion.div>
                        )}

                        <button 
                            onClick={handleUpload}
                            className="w-full bg-gradient-to-r from-rose-400 via-orange-400 to-pink-400 text-white py-4 rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-rose-200/50 mt-4 active:scale-95 hover:shadow-xl hover:brightness-105 transition-all"
                        >
                            Lưu video
                        </button>
                        </div>
                        
                        <button 
                        onClick={() => setIsAddModalOpen(false)}
                        className="absolute top-4 right-4 text-rose-200 hover:text-rose-500 transition-colors"
                        >
                        <IoCloseOutline size={24} />
                        </button>
                    </motion.div>
                    </div>
                )}

                {deletingVideo && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        <div onClick={() => setDeletingVideo(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[3rem] p-10 relative z-[310] text-center">
                            <IoTrashOutline size={40} className="text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-black mb-2">Xóa video này?</h2>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <button onClick={() => setDeletingVideo(null)} className="bg-slate-100 py-4 rounded-2xl font-black">HỦY</button>
                                <button onClick={handleFinalDelete} className="bg-red-500 text-white py-4 rounded-2xl font-black">XÓA</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {activeWord && !isSelectingGroup && (
    <>
        <div className="fixed inset-0 z-[400]" onClick={() => setActiveWord(null)}></div>
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1, transform: 'translate(-50%, calc(-100% - 15px))'}} 
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[410] bg-[#fde8e9] rounded-[2rem] p-5 shadow-2xl w-[260px] text-center border border-rose-100"
            style={{ left: `${popoverPos.x}px`, top: `${popoverPos.y}px`, transform: 'translate(-50%, calc(-100% - 15px))' }}
        >
            {/* Hán tự và Loa phát âm */}
            <div className="relative flex justify-center items-center mb-1 text-[#460809]">
                <span className="text-3xl font-black">{activeWord.char || activeWord.text}</span>
                <button onClick={() => speakChinese(activeWord.char || activeWord.text)} className="absolute right-0 p-1 hover:bg-rose-100 rounded-full transition-colors">
                    <IoVolumeHighOutline size={20} />
                </button>
            </div>

            {/* Pinyin */}
            <p className="text-[12px] font-black text-[#aa232c] tracking-widest mb-3  ">
                / {activeWord.pinyin} /
            </p>

            {/* Loại từ (Badge bo tròn) */}
            <div className="mb-3">
                <span className="bg-[#f8b4b7] text-[#7c1a1e] px-3 py-0.5 rounded-full text-[10px] font-black uppercase">
                    {activeWord.type || "từ"}
                </span>
            </div>
            
            {/* Nghĩa tiếng Việt */}
            <div className="mb-2">
                <p className="text-[15px] text-[#923335] font-bold leading-tight">
                    {activeWord.vi || activeWord.mean}
                </p>
            </div>

            {/* Ghi chú giải thích từ AI (Màu xám, nhỏ) */}
            {activeWord.note && (
                <div className="mb-4 px-2">
                    <p className="text-[12px] text-slate-500  leading-relaxed border-t border-rose-200/50 pt-2">
                        {activeWord.note}
                    </p>
                </div>
            )}

            {/* Nút lưu từ */}
            <button 
                onClick={(e) => { e.stopPropagation(); setIsSelectingGroup(true); }}
                className="w-full bg-[#e7000b] text-white py-3 rounded-2xl text-[11px] font-black uppercase shadow-md hover:bg-[#c10007] active:scale-95 transition-all"
            >
                + Lưu vào bộ từ
            </button>

            {/* Mũi tên trỏ xuống của Popover */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-[#fde8e9]"></div>
        </motion.div>
    </>
)}

                {/* modal bộ từ */}
                {isSelectingGroup && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            onClick={() => setIsSelectingGroup(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative z-[510]"
                        >
                            {/* Header Modal */}
                            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><IoFolderOpenOutline size={20}/></div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-sm uppercase">Lưu vào bộ từ</h3>
                                        {/* <p className="text-[10px] text-slate-400 font-bold">Từ đang chọn: {activeWord?.char || activeWord?.text}</p> */}
                                    </div>
                                </div>
                                <button onClick={() => setIsSelectingGroup(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <IoCloseOutline size={24}/>
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Tạo bộ từ mới */}
                                <div className="flex gap-2 mb-6">
                                    <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="Tên bộ từ mới..." 
                                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 font-medium" />
                                    <button onClick={handleCreateGroup} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all">TẠO</button>
                                </div>

                                {/* Danh sách bộ từ */}
                                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {vocabGroups.length > 0 ? (
                                        vocabGroups.map((g) => (
                                            <button key={g.categoryID} onClick={() => saveWordToGroup(g.categoryID)}
                                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all group"
                                            >
                                                <span className="font-bold text-slate-700 group-hover:text-blue-600">{g.categoryName}</span>
                                                <IoAddCircleOutline size={20} className="text-slate-300 group-hover:text-blue-500"/>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-slate-400 italic text-sm">Chưa có bộ từ nào. Hãy tạo bộ mới!</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VideoLearning;