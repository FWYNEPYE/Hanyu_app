import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    HiOutlineLightningBolt, HiOutlineSave, HiOutlineRefresh, 
    HiOutlineEye, HiChevronLeft, HiOutlinePhotograph, HiOutlineMusicNote 
} from "react-icons/hi";

const ExamConfig = () => {
    const { stepId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(0); 
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({ timeLimit: 40, passScore: 60 });

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

useEffect(() => {
    const fetchExam = async () => {
        try {
            // Gọi API để lấy đề cũ đã lưu
            const res = await axios.get(`http://localhost:5252/api/AdminExam/get-by-step/${stepId}`, { headers });
            
            if (res.data && res.data.questions.length > 0) {
                setQuestions(res.data.questions);
                setConfig({ 
                    timeLimit: res.data.timeLimit, 
                    passScore: res.data.passScore 
                });
                alert("Đã load lại đề cũ sếp đã lưu!");
            }
        } catch (err) {
            console.log("Step này mới tinh, chưa có đề.");
        }
    };
    fetchExam();
}, [stepId]);



    // Hàm tạo đề
    const handleGenerate = async () => {
        if (!window.confirm("Hệ thống sẽ bốc 40 từ vựng ngẫu nhiên từ bộ từ vựng của Step này để tạo đề. Sếp đồng ý không?")) return;
        setLoading(true);
        try {
            const res = await axios.post(`http://localhost:5252/api/AdminExam/generate/${stepId}`, {}, { headers });
            setQuestions(res.data.questions);
            alert("Đã bốc đề xong! Mời sếp thẩm định.");
        } catch (err) {
            alert("Lỗi: Chắc sếp chưa gán Category cho Step này hoặc bộ từ vựng ít hơn 40 từ!");
        } finally { setLoading(false); }
    };

    //  Lưu toàn bộ thay đổi
    const handleSaveAll = async () => {
        try {
            await axios.post(`http://localhost:5252/api/AdminExam/save-exam`, {
                stepId,
                questions,
                ...config
            }, { headers });
            alert("Đã lưu cấu hình bài thi thành công sếp ơi!");
        } catch (err) { alert("Lỗi lưu bài thi!"); }
    };

    const updateQuestionField = (field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[selectedIdx][field] = value;
    setQuestions(updatedQuestions);
};

const getQuestionTypeInfo = (index) => {
    const idx = index + 1; // Chuyển về số thứ tự 1-40
    if (idx <= 5) return { part: "Nghe hiểu", type: "Nghe chọn Đúng/Sai", icon: "🎧" };
    if (idx <= 10) return { part: "Nghe hiểu", type: "Nghe chọn ảnh đúng", icon: "🖼️" };
    if (idx <= 15) return { part: "Nghe hiểu", type: "Nghe chọn ảnh (Loạt ảnh)", icon: "📋" };
    if (idx <= 20) return { part: "Nghe hiểu", type: "Nghe chọn đáp án chữ Hán", icon: "✍️" };
    if (idx <= 25) return { part: "Đọc hiểu", type: "Đọc chữ Hán chọn đáp án", icon: "📖" };
    if (idx <= 30) return { part: "Đọc hiểu", type: "Mô tả chọn ảnh tương ứng", icon: "🖼️" };
    if (idx <= 35) return { part: "Đọc hiểu", type: "Đọc câu hỏi chọn trả lời đúng", icon: "❓" };
    if (idx <= 40) return { part: "Đọc hiểu", type: "Điền từ vào chỗ trống", icon: "✏️" };
    return { part: "Không xác định", type: "", icon: "" };
};

    const currentQ = questions[selectedIdx];

    return (
        <div className="flex h-screen bg-[#0F172A] text-slate-200">
            {/* CỘT TRÁI: DANH SÁCH 40 CÂU */}
            <aside className="w-64 border-r border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-lg"><HiChevronLeft /></button>
                    <span className="font-bold">Cấu hình bài thi</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-2 content-start">
                    {questions.map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setSelectedIdx(i)}
                            className={`aspect-square rounded-lg text-xs font-bold transition-all border ${
                                selectedIdx === i ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <button onClick={handleGenerate} className="w-full py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                        <HiOutlineRefresh /> {loading ? "ĐANG TẠO..." : "TẠO ĐỀ TỰ ĐỘNG"}
                    </button>
                </div>
            </aside>

            {/* CỘT GIỮA: TRÌNH CHỈNH SỬA CHI TIẾT */}
            <main className="flex-1 overflow-y-auto p-8">
                {currentQ ? (
    <div className="max-w-3xl mx-auto space-y-6">
        {/* Chỉ dẫn loại bài thi theo phân đoạn của sếp */}
        {(() => {
            const info = getQuestionTypeInfo(selectedIdx);
            return (
                <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{info.icon}</span>
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{info.part}</p>
                            <p className="text-sm font-bold text-white">{info.type}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Tiến độ</p>
                        <p className="text-lg font-mono font-bold text-blue-500">{selectedIdx + 1}/40</p>
                    </div>
                </div>
            );
        })()}

        <div className="bg-slate-800/50 p-8 rounded-[40px] border border-slate-700 space-y-6 shadow-2xl">
            {/*  HIỂN THỊ MEDIA DỰA TRÊN DẠNG BÀI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audio: Hiện rõ hơn nếu là phần Nghe (1-20) */}
                <div className={`p-5 rounded-3xl border-2 border-dashed transition-all ${selectedIdx < 20 ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 bg-slate-900/50'}`}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-3">
                        <HiOutlineMusicNote /> File nghe (Audio URL)
                    </label>
                    <input 
                        className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-xs outline-none focus:border-blue-500"
                        placeholder="Dán link mp3 vào đây sếp..."
                        value={currentQ.audioUrl || ''}
                        onChange={(e) => updateQuestionField('audioUrl', e.target.value)}
                    />
                    {selectedIdx < 20 && <p className="text-[9px] text-blue-400 mt-2 italic">* Đây là phần bắt buộc phải có file nghe.</p>}
                </div>



                {/* Image */}
<div className={`p-5 rounded-3xl border-2 border-dashed transition-all ${((selectedIdx >= 5 && selectedIdx < 15) || (selectedIdx >= 25 && selectedIdx < 30)) ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-900/50'}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 mb-3">
        <HiOutlinePhotograph /> {selectedIdx >= 25 && selectedIdx < 30 ? "Loạt ảnh tham chiếu (A, B, C, D, E)" : "Hình ảnh minh họa (Image URL)"}
    </label>

    {selectedIdx >= 25 && selectedIdx < 30 ? (
        <div className="space-y-2">
            {['A', 'B', 'C', 'D', 'E'].map((label, i) => {
                // Nếu câu hiện tại ko có ảnh, và ko phải câu 26, thì lấy của câu 26 show ra để sếp biết nó đang dùng chung
                const displayUrl = currentQ.referenceImages?.[i]?.url || (selectedIdx > 25 ? questions[25]?.referenceImages?.[i]?.url : '');
                
                return (
                    <div key={label} className="flex gap-2 items-center">
                        <span className="w-6 text-xs font-black text-emerald-500">{label}</span>
                        <input 
                            className="flex-1 bg-slate-800 border border-slate-700 p-2 rounded-lg text-[10px] outline-none focus:border-emerald-500"
                            placeholder={selectedIdx === 25 ? `Link ảnh ${label}...` : "Đang dùng chung ảnh với câu 26..."}
                            value={currentQ.referenceImages?.[i]?.url || ''} // Khi gõ thì vẫn lưu vào câu hiện tại
                            onChange={(e) => {
                                const newRefs = [...(currentQ.referenceImages || [])];
                                for(let j=0; j<5; j++) if(!newRefs[j]) newRefs[j] = { label: String.fromCharCode(65+j), url: '' };
                                newRefs[i].url = e.target.value;
                                updateQuestionField('referenceImages', newRefs);
                            }}
                        />
                        {displayUrl && <img src={displayUrl} className="w-8 h-8 object-cover rounded shadow-lg border border-slate-600" />}
                    </div>
                );
            })}
            
            {/* Nút Copy nhanh cho sếp nhàn thân */}
            {selectedIdx === 25 && (
                <button 
                    onClick={() => {
                        const img26 = questions[25].referenceImages;
                        if(!img26) return alert("Sếp chưa nhập ảnh câu 26 mà!");
                        const newQs = [...questions];
                        for(let i = 26; i <= 29; i++) {
                            newQs[i].referenceImages = JSON.parse(JSON.stringify(img26));
                        }
                        setQuestions(newQs);
                        alert("Đã áp dụng bộ ảnh 26 cho toàn bộ câu 27-30!");
                    }}
                    className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black rounded-lg transition-all"
                >
                    ÁP DỤNG BỘ ẢNH NÀY CHO CÂU 27-30
                </button>
            )}
        </div>
    ) : (
        // --- CHẾ ĐỘ NHẬP 1 ẢNH DUY NHẤT (Mặc định) ---
        <input 
            className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-xs outline-none focus:border-emerald-500"
            placeholder="Dán link ảnh vào đây sếp..."
            value={currentQ.imageUrl || ''}
            onChange={(e) => updateQuestionField('imageUrl', e.target.value)}
        />
    )}
</div>
            </div>

            {/*  NỘI DUNG CHÍNH */}
            <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Nội dung câu hỏi / Câu mô tả</label>
                <textarea 
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 p-5 rounded-3xl text-2xl font-bold focus:border-blue-500 outline-none resize-none"
                    value={currentQ.content || ''}
                    onChange={(e) => updateQuestionField('content', e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Pinyin (Nếu có)</label>
                        <input 
                            className="w-full bg-slate-900 border border-slate-700 p-3 rounded-2xl text-sm italic outline-none text-slate-400"
                            value={currentQ.pinyin || ''}
                            onChange={(e) => updateQuestionField('pinyin', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Giải thích / Dịch nghĩa</label>
                        <input 
                            className="w-full bg-slate-900 border border-slate-700 p-3 rounded-2xl text-sm outline-none text-slate-500"
                            placeholder="Ghi chú cho sếp..."
                        />
                    </div>
                </div>
            </div>

            {/* ĐÁP ÁN TRẮC NGHIỆM */}
            <div className="grid grid-cols-2 gap-4 pt-4">
                {['A', 'B', 'C', 'D'].map((label, i) => (
                    <div key={label} className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${
                             currentQ.correctAnswer === currentQ.options[i] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 text-slate-500 group-hover:border-blue-500'
                        }`}>
                            {label}
                        </div>
                        <input 
                            placeholder={`Lựa chọn ${label}...`}
                            className={`w-full bg-slate-900 border pl-14 pr-12 py-4 rounded-2xl text-sm outline-none transition-all ${
                                currentQ.correctAnswer === currentQ.options[i] ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-700 focus:border-blue-500'
                            }`}
                            value={currentQ.options[i] || ''}
                            onChange={(e) => {
                                const newQs = [...questions];
                                newQs[selectedIdx].options[i] = e.target.value;
                                setQuestions(newQs);
                            }}
                        />
                        <input 
                            type="radio" 
                            name={`correct-${selectedIdx}`} 
                            checked={currentQ.correctAnswer === currentQ.options[i]}
                            onChange={() => {
                                const newQs = [...questions];
                                newQs[selectedIdx].correctAnswer = currentQ.options[i];
                                setQuestions(newQs);
                            }}
                            className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 accent-emerald-500 cursor-pointer" 
                        />
                    </div>
                ))}
            </div>
        </div>
    </div>
) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <HiOutlineLightningBolt size={48} className="mb-4 opacity-20" />
                        <p>Bấm "Tạo đề tự động" để bắt đầu nhé sếp!</p>
                    </div>
                )}
            </main>

            {/* CỘT PHẢI: CÀI ĐẶT CHUNG */}
            <aside className="w-64 border-l border-slate-800 p-6 space-y-6">
                <h5 className="text-xs font-black uppercase tracking-widest text-slate-500">Cấu hình chung</h5>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Thời gian (Phút)</label>
                        <input type="number" className="w-full bg-slate-800 p-2 rounded-lg mt-1" value={config.timeLimit} onChange={e => setConfig({...config, timeLimit: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Điểm đạt (%)</label>
                        <input type="number" className="w-full bg-slate-800 p-2 rounded-lg mt-1" value={config.passScore} onChange={e => setConfig({...config, passScore: e.target.value})} />
                    </div>
                </div>

                <div className="pt-10 space-y-2">
                    <button onClick={handleSaveAll} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                        <HiOutlineSave /> LƯU BÀI THI
                    </button>
                    <button 
    onClick={() => setIsPreviewOpen(true)} 
    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-bold flex items-center justify-center gap-2"
>
    <HiOutlineEye /> XEM PREVIEW
</button>
                </div>
            </aside>



            {/* MODAL PREVIEW  */}
{isPreviewOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="bg-white text-slate-900 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl relative">
            {/* Header Modal */}
            <div className="bg-slate-100 px-8 py-4 flex justify-between items-center border-b">
                <span className="font-black text-slate-400 uppercase tracking-tighter">Preview: Câu {selectedIdx + 1}</span>
                <button onClick={() => setIsPreviewOpen(false)} className="text-slate-500 hover:text-red-500 font-bold">ĐÓNG [X]</button>
            </div>

            <div className="p-8 space-y-6">
                {/*  Giả lập Audio nếu là câu nghe */}
                {currentQ.audioUrl && (
                    <div className="bg-blue-50 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white animate-pulse">
                            <HiOutlineMusicNote size={24} />
                        </div>
                        <audio controls className="flex-1 h-8">
                            <source src={currentQ.audioUrl} type="audio/mpeg" />
                        </audio>
                    </div>
                )}

                {/* Giả lập Hình ảnh */}
{(currentQ.imageUrl || (selectedIdx >= 25 && selectedIdx < 30)) && (
    <div className="flex flex-col items-center bg-slate-50 rounded-3xl p-4 border border-slate-100">
        {selectedIdx >= 25 && selectedIdx < 30 ? (
            <div className="grid grid-cols-5 gap-2 w-full">
                {/* Logic: Mượn ảnh câu 26 nếu câu này trống */}
                {(currentQ.referenceImages || questions[25]?.referenceImages)?.map((img, i) => (
                    <div key={i} className="text-center">
                        <img src={img.url || "https://placehold.co/100"} className="w-full aspect-square object-cover rounded-lg border shadow-sm" />
                        <span className="text-[10px] font-black text-slate-400">{img.label}</span>
                    </div>
                ))}
            </div>
        ) : (
            <img src={currentQ.imageUrl} className="max-h-48 object-contain rounded-lg shadow-md" />
        )}
    </div>
)}

                {/*  Nội dung câu hỏi */}
                <div className="text-center space-y-2">
                    <h3 className="text-3xl font-bold text-slate-800">{currentQ.content || "Chưa nhập nội dung"}</h3>
                    <p className="text-lg text-slate-400 italic">{currentQ.pinyin}</p>
                </div>

                {/* 4. Giả lập đáp án */}
                <div className="grid grid-cols-1 gap-3">
                    {currentQ.options.map((opt, i) => (
                        <div 
                            key={i}
                            className={`p-4 rounded-2xl border-2 font-bold transition-all ${
                                currentQ.correctAnswer === opt 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                : 'border-slate-200 text-slate-500'
                            }`}
                        >
                            <span className="mr-3 opacity-50">{String.fromCharCode(65 + i)}.</span>
                            {opt || "..."}
                            {currentQ.correctAnswer === opt && <span className="float-right">✅ (Đáp án đúng)</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-50 p-6 text-center text-[10px] text-slate-400 font-bold">
                Giao diện người dùng
            </div>
        </div>
    </div>
)}
        </div>
    );
};

export default ExamConfig;