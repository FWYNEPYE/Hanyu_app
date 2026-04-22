import React, { useState, useEffect } from 'react';
import { HiOutlineTrash, HiOutlineUserRemove, HiOutlineRefresh, HiOutlineExclamationCircle } from "react-icons/hi";
import axios from 'axios';
import { format } from 'date-fns';

const ChatManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminInput, setAdminInput] = useState("");


  const currentAdminId = Number(localStorage.getItem('userId')) || 0; 

  // Lấy tin nhắn từ Backend
  const fetchMonitor = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5252/api/AdminCommunityChat/monitor');
      setMessages(res.data);
    } catch (err) {
      console.error("Không lấy được dữ liệu chat!", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitor();
    const interval = setInterval(fetchMonitor, 3000);
    return () => clearInterval(interval);
  }, []);

  // 2. Xóa tin nhắn
  const handleDelete = async (id) => {
    if (window.confirm("Xóa tin nhắn này?")) {
      try {
        await axios.delete(`http://localhost:5252/api/AdminCommunityChat/delete-message/${id}`);
        fetchMonitor();
      } catch (err) { alert("Xóa thất bại!"); }
    }
  };

  // Khóa mõm User
  const handleMute = async (userId, username) => {
    if (window.confirm(`Khóa mõm ${username} nhé?`)) {
      try {
        await axios.put(`http://localhost:5252/api/AdminCommunityChat/mute-user/${userId}`);
        fetchMonitor();
      } catch (err) { alert("Lỗi khi khóa người dùng!"); }
    }
  };


  const handleUnmute = async (userId, username) => {
    if (window.confirm(`Mở khóa cho ${username} nhé?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5252/api/AdminCommunityChat/unmute-user/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Đã hoàn trả tự động cho ẻm!");
        fetchMonitor();
      } catch (err) { alert("Lỗi khi mở khóa!"); }
    }
  };


  // Admin gửi tin
  const sendAdminMessage = async () => {
    if (!adminInput.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5252/api/social/send-message', 
        { content:   adminInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdminInput("");
      fetchMonitor();
    } catch (err) {
      alert("Lỗi gửi tin sếp ơi!");
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Xóa toàn bộ lịch sử chat?")) {
        try {
            const token = localStorage.getItem('token');
            await axios.delete('http://localhost:5252/api/AdminCommunityChat/clear-all-history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setMessages([]); 
            alert("Đã dọn dẹp xong rồi sếp!");
        } catch (err) {
            alert("Lỗi!");
        }
    }
};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white  tracking-tighter">Quản lý Chat cộng đồng</h2>
        </div>
        <button 
          onClick={fetchMonitor}
          className="p-3 bg-[#161B26] border border-slate-800 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"
        >
          <HiOutlineRefresh className={loading ? "animate-spin" : ""} size={20} />
        </button>
      </div>

      {/* Bảng Chat chính */}
      <div className="bg-[#161B26] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[calc(100vh-250px)]"> 
        {/* Banner Live */}
        <div className="p-4 border-b border-slate-800 bg-[#1E2533]/30 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chat</span>
            </div>
            <button 
                onClick={handleClearAll} // <-- Gắn vào đây
                className="text-[10px] bg-rose-500/10 text-rose-500 px-4 py-1.5 rounded-xl font-black hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest"
            >
                Xóa tất cả
            </button>
        </div>
        
        {/* Danh sách tin nhắn  */}
        <div className="divide-y divide-slate-800/50 overflow-y-auto custom-scrollbar flex-1 bg-[#161B26] flex flex-col-reverse"> 
  
          {messages.map((msg) => (
            <div key={msg.id} className={`p-4 hover:bg-white/5 transition-all flex justify-between items-center group ${msg.isDanger ? 'bg-rose-500/5' : ''}`}>
              <div className="flex gap-4 items-start">
                <div className="text-[10px] text-slate-600 mt-1.5 font-mono bg-[#0B0F1A] px-2 py-1 rounded">
                  {format(new Date(msg.time), 'HH:mm:ss')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${msg.isDanger ? 'text-rose-500' : 'text-blue-400'}`}>
                      {msg.user}
                    </span>
                    {msg.isDanger && (
                      <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black flex items-center gap-1 animate-pulse">
                        <HiOutlineExclamationCircle /> SPAM
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mt-1 leading-relaxed break-all">{msg.content}</p>
                </div>
              </div>
              
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleDelete(msg.id)} title="Xóa tin nhắn" className="p-2.5 text-slate-500 hover:text-rose-500">
                    <HiOutlineTrash size={18}/>
                </button>
                
                {msg.userId !== currentAdminId && (
                    <>
                        {msg.isMuted ? (
                            <button 
                                onClick={() => handleUnmute(msg.userId, msg.user)} 
                                title="Mở khóa" 
                                className="p-2.5 text-green-500 hover:scale-125 transition-transform"
                            >
                                <HiOutlineRefresh size={18}/> 
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleMute(msg.userId, msg.user)} 
                                title="Khóa mõm thằng này" 
                                className="p-2.5 text-slate-500 hover:text-orange-500"
                            >
                                <HiOutlineUserRemove size={18}/>
                            </button>
                        )}
                    </>
                )}
              </div>
            </div>
          ))}

          {messages.length === 0 && !loading && (
            <div className="p-10 text-center text-slate-600 italic">Hệ thống đang chờ tin nhắn mới...</div>
          )}
        </div>

        {/* Ô Chat Admin - Cố định ở đáy */}
        <div className="p-4 bg-[#1E2533] border-t border-slate-800 flex gap-3 items-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white">AD</div>
          <input 
            type="text"
            value={adminInput}
            onChange={(e) => setAdminInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendAdminMessage()}
            placeholder="Gửi thông báo tới Community..."
            className="flex-1 bg-[#0B0F1A] border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500 transition-all"
          />
          <button onClick={sendAdminMessage} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase transition-all">
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatManagement;