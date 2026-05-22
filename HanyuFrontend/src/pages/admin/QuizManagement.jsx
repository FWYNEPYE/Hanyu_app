import React, { useState, useEffect } from 'react';
import { 
  HiOutlinePlus, HiOutlineSparkles, HiOutlineLightBulb, 
  HiOutlineBadgeCheck, HiOutlineTrash, HiOutlineRefresh 
} from "react-icons/hi";
import axios from 'axios';

const QuizManagement = () => {
  const [puzzles, setPuzzles] = useState([]);
  const [formData, setFormData] = useState({ correctSentence: '', pinyin: '', pointsReward: 10 });
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);


  // 1. Load dữ liệu từ API
  const fetchPuzzles = async () => {
    try {
      const res = await axios.get('/api/AdminQuiz/all');
      setPuzzles(res.data);
    } catch (err) { console.error("Lỗi rồi sếp:", err); }
  };

  useEffect(() => { fetchPuzzles(); }, []);

  //  Xử lý thêm mới
const handleSubmit = async () => {
  if (!formData.correctSentence) return alert("Nhập câu đã sếp ơi!");
  setLoading(true);
  try {
    if (editingId) {
      // Chế độ CẬP NHẬT
      await axios.put(`/api/AdminQuiz/update/${editingId}`, formData);
    } else {
      // Chế độ THÊM MỚI
      await axios.post('/api/AdminQuiz/add', formData);
    }
    
    // Reset mọi thứ về ban đầu
    setFormData({ correctSentence: '', pinyin: '', pointsReward: 10 });
    setEditingId(null);
    fetchPuzzles();
    alert(editingId ? "Cập nhật xong rồi sếp!" : "Thêm mới thành công!");
  } catch (err) {
    alert("Lỗi rồi, sếp kiểm tra lại Backend nhé");
  }
  setLoading(false);
};
  // Xử lý xóa
  const handleDelete = async (id) => {
    if (window.confirm("Xóa câu này là mất luôn dữ liệu học của user đó sếp?")) {
      await axios.delete(`/api/AdminQuiz/delete/${id}`);
      fetchPuzzles();
    }
  };
  const handleEdit = (puzzle) => {
  setEditingId(puzzle.id); // Lưu ID lại để biết đang sửa câu nào
  setFormData({
    correctSentence: puzzle.content,
    pinyin: puzzle.pinyin,
    pointsReward: puzzle.points
  });
  // Cuộn lên đầu trang cho sếp dễ nhìn cái form
  window.scrollTo({ top: 0, behavior: 'smooth' });
};


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white   tracking-tighter">Quản lý Thử thách</h2>
        </div>
        <button onClick={fetchPuzzles} className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all">
          <HiOutlineRefresh className={loading ? "animate-spin" : ""} size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORM SOẠN CÂU ĐỐ */}
        <div className="lg:col-span-4">
          <div className="bg-[#161B26] border border-slate-800 p-8 rounded-[32px] sticky top-8 shadow-2xl">
            <h3 className="text-white font-black uppercase text-xs mb-6 flex items-center gap-3 tracking-[0.2em]">
        <div className={`p-2 rounded-lg ${editingId ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
          <HiOutlineLightBulb />
        </div>
        {editingId ? "Đang Chỉnh Sửa" : "Thêm Thử Thách"}
      </h3>


            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Câu Hán tự hoàn chỉnh</label>
                <input 
                  value={formData.correctSentence}
                  onChange={e => setFormData({...formData, correctSentence: e.target.value})}
                  type="text" placeholder="VD: 我|爱|学习" 
                  className="w-full bg-[#0B0F1A] border border-slate-700 rounded-2xl px-5 py-4 text-sm mt-2 outline-none text-white focus:border-blue-500 transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phiên âm Pinyin</label>
                <input 
                  value={formData.pinyin}
                  onChange={e => setFormData({...formData, pinyin: e.target.value})}
                  type="text" placeholder="VD: Wǒ|ài|xuéxí" 
                  className="w-full bg-[#0B0F1A] border border-slate-700 rounded-2xl px-5 py-4 text-sm mt-2 outline-none text-white focus:border-blue-500 transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest ml-1">Điểm thưởng (Points)</label>
                <input 
                  value={formData.pointsReward}
                  onChange={e => setFormData({...formData, pointsReward: parseInt(e.target.value)})}
                  type="number" className="w-full bg-[#0B0F1A] border border-slate-700 rounded-2xl px-5 py-4 text-sm mt-2 outline-none text-white focus:border-yellow-500 transition-all" 
                />
              </div>

              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all uppercase text-[11px] tracking-widest shadow-lg active:scale-95 disabled:opacity-50"
              >
                {editingId ? "Cập Nhật Ngay" : "Lưu vào hệ thống"}
              </button>
              {editingId && (
                <button 
                  onClick={() => { setEditingId(null); setFormData({correctSentence: '', pinyin: '', pointsReward: 10}); }}
                  className="w-full mt-4 text-[10px] text-slate-500 font-bold uppercase hover:text-white"
                >
                  Hủy và Thêm mới
                </button>
              )}
            </div>
          </div>
        </div>

        {/* DANH SÁCH CÂU ĐỐ */}
        <div className="lg:col-span-8 space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 mb-2">Danh sách câu đố hiện có ({puzzles.length})</p>
          
          {puzzles.map((q, idx) => (
            <div key={q.id} className="bg-[#161B26] border border-slate-800 p-6 rounded-3xl flex justify-between items-center group hover:border-blue-500/30 transition-all">
              <div className="flex gap-5 items-center">
                 <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500 font-black border border-slate-700">
                    {idx + 1}
                 </div>
                 <div>
                    <p className="text-xl font-bold text-white tracking-tight">{q.content}</p>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="text-[11px] text-red-400 font-bold ">{q.pinyin}</span>
                       <span className="text-[10px] text-green-500 font-black uppercase flex items-center gap-1">
                         <HiOutlineBadgeCheck size={14}/> +{q.points} Points
                       </span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                 <button 
                    onClick={() => handleEdit(q)} // Truyền nguyên cái object câu đố vào
                    className={`p-3 rounded-xl transition-all ${editingId === q.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-blue-500'}`}
                  >
                    <HiOutlineSparkles size={20} />
                  </button>
                 <button 
                   onClick={() => handleDelete(q.id)}
                   className="p-3 bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                 >
                   <HiOutlineTrash size={20} />
                 </button>
              </div>
            </div>
          ))}

          {puzzles.length === 0 && (
            <div className="text-center py-20 bg-[#161B26] rounded-[32px] border border-dashed border-slate-800 text-slate-600 italic">
              Chưa có câu đố nào trong kho!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;