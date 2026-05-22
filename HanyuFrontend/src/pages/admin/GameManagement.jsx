import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HiOutlinePuzzle, HiOutlinePlus, HiOutlineAdjustments,
  HiOutlineEye, HiOutlineEyeOff, HiOutlinePlay,
  HiOutlineClipboardList, HiOutlineAcademicCap, HiOutlineVolumeUp,
  HiOutlineLightningBolt, HiOutlinePencilAlt, HiOutlineRefresh
} from "react-icons/hi";

const gameUIConfig = {
  flashcard: { icon: HiOutlineClipboardList, color: "bg-purple-500", desc: "Lật thẻ ghi nhớ" },
  mcq: { icon: HiOutlineAcademicCap, color: "bg-orange-500", desc: "Trắc nghiệm kiến thức" },
  match: { icon: HiOutlinePuzzle, color: "bg-blue-500", desc: "Ghép đôi từ vựng" },
  type: { icon: HiOutlinePencilAlt, color: "bg-green-500", desc: "Luyện gõ chữ Hán" },
  listen: { icon: HiOutlineVolumeUp, color: "bg-cyan-500", desc: "Phản xạ nghe hiểu" },
  mix: { icon: HiOutlineLightningBolt, color: "bg-pink-500", desc: "Tổng hợp các kỹ năng" },
  srs: { icon: HiOutlineRefresh, color: "bg-gray-700", desc: "Ôn tập ngắt quãng" },
};

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  const fetchGames = async () => {
    try {
      const response = await axios.get("/api/Minigame/settings");
      const mergedData = response.data.map(dbGame => ({
        ...dbGame,
        ...gameUIConfig[dbGame.gameId] 
      }));
      setGames(mergedData);
    } catch (error) {
      console.error("Lỗi API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGames(); }, []);

  const handlePreviewGame = (e, gameId) => {
    e.preventDefault();
    e.stopPropagation();
    const previewUrl = `${window.location.origin}/dashboard/game?gameId=${gameId}&mode=preview`;
    window.open(previewUrl, '_blank');
  };

  const openConfig = (game) => {
    setEditingGame({ ...game });
    setIsConfigOpen(true);
  };

const handleAddNew = () => {
  setEditingGame({ 
    gameId: '', 
    name: '', 
    difficulty: 'Easy', 
    basePoint: 10, 
    timeLimit: 60,
    minQuestions: 5,
    description: '', 
    status: 'Active', 
    isNew: true 
  });
  setIsConfigOpen(true);
};

  const saveConfig = async () => {
    try {
      if (editingGame.isNew) {
        await axios.post(`/api/Minigame/settings`, editingGame);
      } else {
        await axios.put(`/api/Minigame/settings/${editingGame.gameId}`, editingGame);
      }
      fetchGames(); 
      setIsConfigOpen(false);
      alert("Đã lưu thay đổi!");
    } catch (error) {
      alert("Lỗi khi lưu dữ liệu!");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Maintenance' : 'Active';
    try {
      await axios.put(`/api/Minigame/settings/${id}/status`, 
        JSON.stringify(newStatus), 
        { headers: { 'Content-Type': 'application/json' } }
      );
      setGames(games.map(g => g.gameId === id ? { ...g, status: newStatus } : g));
    } catch (error) {
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  if (loading) return <div className="p-10 text-white text-center font-bold animate-pulse">📡 Đang kết nối hệ thống...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight  ">Quản lý Games</h2>
          <p className="text-slate-500 text-sm">Quản lý tham số, độ khó và trạng thái vận hành của trò chơi</p>
        </div>
        <button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1">
          <HiOutlinePlus size={22}/> THÊM GAME MỚI
        </button>
      </div>

      {/* Grid danh sách */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map(game => (
          <div key={game.gameId} className="bg-[#1C2333]/50 backdrop-blur-sm border border-slate-800 rounded-[40px] p-8 hover:border-indigo-500/40 transition-all group">
            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 ${game.color || 'bg-slate-600'} text-white rounded-[24px] shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                {game.icon ? <game.icon size={32} /> : <HiOutlinePuzzle size={32} />}
              </div>
              <button 
                onClick={() => toggleStatus(game.gameId, game.status)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all ${
                  game.status === 'Active' 
                  ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' 
                  : 'bg-rose-500/5 text-rose-500 border-rose-500/20'
                }`}
              >
                {game.status === 'Active' ? "● Đang chạy" : "○ Bảo trì"}
              </button>
            </div>

            <div className="space-y-2 mb-8">
              <h3 className="text-2xl font-bold text-white leading-none">{game.name}</h3>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{game.gameId}</p>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => openConfig(game)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-[20px] text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                <HiOutlineAdjustments size={18}/> Cấu hình
              </button>
              <button 
                onClick={(e) => handlePreviewGame(e, game.gameId)} 
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-[20px] text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/5"
              >
                <HiOutlinePlay size={18}/> Xem trước
              </button>
            </div>
          </div>
        ))}
      </div>

{isConfigOpen && editingGame && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in" onClick={() => setIsConfigOpen(false)}></div>

    <div className="bg-[#111827] border border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-transparent p-6 border-b border-white/5 flex items-center gap-4">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
          <HiOutlineAdjustments size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">Thiết lập tham số vận hành</h3>
          <p className="text-slate-400 text-xs">Sếp đang tinh chỉnh bộ não của game: <span className="text-indigo-400">{editingGame.name || "Game mới"}</span></p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-2 gap-6">
        {/* Cột trái: Thông tin cơ bản */}
        <div className="space-y-5">
          {editingGame.isNew && (
            <div className="space-y-2">
              <label className="text-slate-400 text-[11px] font-black uppercase tracking-wider ml-1">Mã Game (ID)</label>
              <input 
                className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-3.5 text-white focus:border-indigo-500 outline-none transition-all font-mono"
                value={editingGame.gameId}
                onChange={(e) => setEditingGame({...editingGame, gameId: e.target.value.toLowerCase()})}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-slate-400 text-[11px] font-black uppercase tracking-wider ml-1">Tên hiển thị</label>
            <input 
              className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-3.5 text-white focus:border-indigo-500 outline-none transition-all"
              value={editingGame.name}
              onChange={(e) => setEditingGame({...editingGame, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-400 text-[11px] font-black uppercase tracking-wider ml-1">Mô tả ngắn</label>
            <textarea 
              rows="3"
              className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-3.5 text-white focus:border-indigo-500 outline-none transition-all resize-none text-sm"
              placeholder="Ví dụ: Luyện phản xạ từ vựng qua hình ảnh..."
              value={editingGame.description}
              onChange={(e) => setEditingGame({...editingGame, desc: e.target.value})}
            ></textarea>
          </div>
        </div>

        {/* Cột phải: Chỉ số Gameplay */}
        <div className="space-y-5 bg-white/5 p-6 rounded-3xl border border-white/5">
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-indigo-400 text-[11px] font-black uppercase tracking-wider ml-1">Độ khó hệ thống</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3.5 text-white outline-none cursor-pointer appearance-none"
                value={editingGame.difficulty}
                onChange={(e) => setEditingGame({...editingGame, difficulty: e.target.value})}
              >
                <option value="Easy">Easy - Cơ bản</option>
                <option value="Medium">Medium - Trung bình</option>
                <option value="Hard">Hard - Nâng cao</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-indigo-400 text-[11px] font-black uppercase tracking-wider ml-1">Thời gian (s)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-indigo-500"
                  value={editingGame.timeLimit}
                  onChange={(e) => setEditingGame({...editingGame, timeLimit: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-indigo-400 text-[11px] font-black uppercase tracking-wider ml-1">Điểm cơ bản</label>
                <input 
                  type="number"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-indigo-500"
                  value={editingGame.basePoint}
                  onChange={(e) => setEditingGame({...editingGame, basePoint: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-indigo-400 text-[11px] font-black uppercase tracking-wider ml-1">Số câu hỏi tối thiểu</label>
              <input 
                type="number"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-indigo-500"
                value={editingGame.minQuestions}
                onChange={(e) => setEditingGame({...editingGame, minQuestions: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4">
        <button onClick={() => setIsConfigOpen(false)} className="flex-1 py-4 rounded-2xl text-slate-400 font-bold hover:bg-white/5 transition-all uppercase text-xs tracking-widest">Hủy bỏ</button>
        <button onClick={saveConfig} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-xs">Xác nhận cập nhật</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default GameManagement;