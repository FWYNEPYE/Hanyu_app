import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  HiOutlineBookOpen, HiOutlineThumbUp, HiOutlineCheckCircle, 
  HiOutlineXCircle, HiOutlineDotsVertical, HiOutlineEye, 
  HiOutlineCollection, HiOutlineTag, HiOutlineRefresh, HiX, HiOutlineLockClosed
} from "react-icons/hi";

const CommunityManagement = () => {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 
  const [viewingDeck, setViewingDeck] = useState(null);

  const fetchRankings = useCallback(async () => {
    try {
      setLoading(true);
      // API lấy toàn bộ deck (kể cả deck đã bị khóa)
      const res = await axios.get(`http://localhost:5252/api/AdminCommunity/all-decks`);
      setSets(res.data);
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const handleApprove = async (id) => {
    if (window.confirm("Duyệt bộ từ này lên công khai?")) {
      try {
        await axios.put(`http://localhost:5252/api/AdminCommunity/approve/${id}`);
        fetchRankings();
      } catch (error) {
        alert("Lỗi khi duyệt!");
      }
    }
  };


  const handleReject = async (id) => {
    if (window.confirm("Sếp muốn khóa bộ từ này lại, không cho phép công khai đúng không?")) {
      try {
        await axios.put(`http://localhost:5252/api/AdminCommunity/reject/${id}`);
        alert("Đã khóa bộ từ thành công!");
        fetchRankings();
      } catch (error) {
        alert("Lỗi khi thực hiện khóa bộ từ!");
      }
    }
  };

  return (
    <div className="flex-1 min-w-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-0">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white  tracking-tighter ">Quản lý Cộng đồng Hanyu</h2>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={fetchRankings} className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
              <HiOutlineRefresh size={20} className={loading ? "animate-spin" : ""} />
            </button>

            <div className="flex gap-2 bg-[#161B26] p-1 rounded-xl border border-slate-700">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'Pending', label: 'Đang chờ' },
                { id: 'Reported', label: 'Bị báo cáo' },
                { id: 'Rejected', label: 'Đã khóa' }
              ].map((f) => (
                <button 
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${
                    filter === f.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* List Card */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
            [1,2,3].map(i => <div key={i} className="h-32 w-full bg-slate-800/20 animate-pulse rounded-2xl border border-slate-800"></div>)
        ) : (
          sets.filter(s => filter === "all" || s.status === filter).map((set) => (
            <div key={set.id} className="bg-[#161B26] border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                    set.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-blue-600/20 border-blue-500/20 text-blue-400'
                  }`}>
                      {set.status === 'Rejected' ? <HiOutlineLockClosed size={32} /> : <HiOutlineBookOpen size={32} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{set.setName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          set.status === 'Đang chờ' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                          set.status === 'Đã duyệt' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                          {set.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><HiOutlineTag className="text-blue-500"/> {set.level}</span>
                      <span className="flex items-center gap-1"><HiOutlineCollection className="text-purple-500"/> {set.wordCount} từ</span>
                      <span className="flex items-center gap-1"><HiOutlineThumbUp className="text-pink-500"/> {set.likes} like</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <img 
                          src={set.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(set.user)}&background=random&color=fff&bold=true&rounded=true`} 
                          className="w-7 h-7 rounded-xl bg-slate-800 object-cover border border-slate-700 shadow-sm transition-transform group-hover:scale-110" 
                          alt="avatar" 
                        />
                      <span className="text-[11px] text-slate-400">Người đăng: <b className="text-slate-200">{set.user}</b></span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                      {set.status !== "Đã duyệt" && (
                          <button onClick={() => handleApprove(set.id)} className="p-2.5 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm">
                              <HiOutlineCheckCircle size={20}/>
                          </button>
                      )}
                      {set.status !== "Đã khóa" && (
                        <button onClick={() => handleReject(set.id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Khóa bộ từ">
                            <HiOutlineXCircle size={20}/>
                        </button>
                      )}
                  </div>
                  <button onClick={() => setViewingDeck(set)} className="mt-2 flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-500 transition-all uppercase">
                      <HiOutlineEye size={16} /> Xem nội dung
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Xem nội dung  */}
      {viewingDeck && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingDeck(null)} />
          <div className="relative w-full max-w-4xl bg-[#161B26] border border-slate-700 rounded-[32px] shadow-2xl p-8 text-white overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black  tracking-tighter text-blue-400">Chi tiết bộ từ: {viewingDeck.setName}</h3>
                  <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700">
                    {viewingDeck.wordCount} TỪ
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase mt-1">Người đăng: {viewingDeck.user}     • Hạng: {viewingDeck.level}</p>
              </div>
              <button onClick={() => setViewingDeck(null)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                <HiX size={24}/>
              </button>
            </div>

            {/* Bảng danh sách từ vựng */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
              <div className="grid grid-cols-5 gap-4 p-4 border-b border-slate-800 bg-slate-800/30 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div className="col-span-1">Hán tự</div>
                <div className="col-span-1 text-center">Pinyin</div>
                <div className="col-span-1 text-center">Nghĩa</div>
                <div className="col-span-2">Ví dụ / Ghi chú</div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                {viewingDeck.vocabularies?.length > 0 ? (
                  viewingDeck.vocabularies.map((v, i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-slate-800/50 items-center hover:bg-slate-800/20 transition-colors">
                      {/* Hán tự */}
                      <div className="col-span-1">
                        <span className="text-lg font-bold text-white">{v.word}</span>
                      </div>
                      {/* Pinyin */}
                      <div className="col-span-1 text-center">
                        <span className="text-xs font-bold text-red-400 ">[{v.pinyin}]</span>
                      </div>
                      {/* Nghĩa */}
                      <div className="col-span-1 text-center">
                        <span className="text-sm font-bold text-blue-300">{v.meaning}</span>
                      </div>
                      {/* Ví dụ / Ghi chú */}
                      <div className="col-span-2">
                        <p className="text-[11px] text-slate-400 leading-relaxed ">
                          {v.example || <span className="opacity-30 ">Không có ví dụ...</span>}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-500 italic">Trống trơn sếp ơi...</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => { handleApprove(viewingDeck.id); setViewingDeck(null); }} 
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-green-500 shadow-lg shadow-green-900/20 transition-all"
              >
                <HiOutlineCheckCircle size={18}/> Duyệt ngay
              </button>
              <button 
                onClick={() => { handleReject(viewingDeck.id); setViewingDeck(null); }} 
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 hover:text-white transition-all"
              >
                <HiOutlineLockClosed size={18}/> Khóa bộ từ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityManagement;