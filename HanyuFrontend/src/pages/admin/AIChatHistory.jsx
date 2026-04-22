import React, { useState, useEffect } from 'react';
import { HiOutlineUser, HiOutlineHashtag, HiOutlineChatAlt2, HiOutlineChevronRight } from "react-icons/hi";
import axios from 'axios';

const AIChatHistory = () => {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Load danh sách User ban đầu
  useEffect(() => {
    axios.get('http://localhost:5252/api/AdminAI/users-active').then(res => setUsers(res.data));
  }, []);

  // Khi chọn User -> Load danh sách Session
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setSelectedSessionId(null);
    setMessages([]);
    const res = await axios.get(`http://localhost:5252/api/AdminAI/user-sessions/${user.userID}`);
    setSessions(res.data);
  };

  // Khi chọn Session -> Load nội dung Chat
  const handleSelectSession = async (sessionId) => {
    setSelectedSessionId(sessionId);
    const res = await axios.get(`http://localhost:5252/api/AdminAI/session-detail/${sessionId}`);
    setMessages(res.data);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)] animate-in fade-in duration-500">
      
      {/* DANH SÁCH HỌC VIÊN  */}
      <div className="w-1/4 bg-[#161B26] border border-slate-800 rounded-[2rem] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-[#1E2533]/30">
          <h3 className="text-white font-black uppercase text-[10px] tracking-widest text-blue-500">Học viên</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {users.map(u => (
            <button key={u.userID} onClick={() => handleSelectUser(u)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedUser?.userID === u.userID ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${selectedUser?.userID === u.userID ? 'bg-white/20' : 'bg-slate-900 border border-slate-800'}`}>
                ID:{u.userID}
              </div>
              <span className="font-bold text-sm truncate">{u.username}</span>
            </button>
          ))}
        </div>
      </div>

      {/*  DANH SÁCH PHIÊN (Sessions) */}
      <div className="w-1/4 bg-[#161B26] border border-slate-800 rounded-[2rem] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-[#1E2533]/30">
          <h3 className="text-white font-black uppercase text-[10px] tracking-widest text-emerald-500">Phiên hội thoại</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {!selectedUser ? (
            <div className="h-full flex items-center justify-center text-slate-600 italic text-[10px] text-center px-4">Hãy chọn một học viên bên trái sếp ơi!</div>
          ) : (
            sessions.map(s => (
              <button key={s.sessionID} onClick={() => handleSelectSession(s.sessionID)}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedSessionId === s.sessionID ? 'bg-emerald-600 border-emerald-500 shadow-lg text-white' : 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-300'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <HiOutlineHashtag size={12} className={selectedSessionId === s.sessionID ? 'text-white' : 'text-emerald-500'}/>
                  <span className="text-[10px] font-black uppercase opacity-70">Session ID</span>
                </div>
                <div className="text-[11px] font-mono truncate mb-2">{s.sessionID}</div>
                <div className="text-[9px] font-bold opacity-50 flex items-center gap-1"><HiOutlineChatAlt2/> {s.lastActive}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* NỘI DUNG CHAT (Details) */}
      <div className="flex-1 bg-[#161B26] border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
        {!selectedSessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
             <HiOutlineChatAlt2 size={64} className="mb-4 opacity-10" />
             <p className="font-bold italic uppercase tracking-widest text-xs opacity-30">Chi tiết hội thoại</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-800 bg-[#1E2533]/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black">AD</div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase">Đang giám sát</p>
                  <p className="text-white font-bold text-sm">{selectedUser?.username} <span className="text-slate-600 mx-2">|</span> <span className="text-emerald-500 text-xs">{selectedSessionId.slice(0,8)}...</span></p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#0D1117] custom-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#1E2533] border border-slate-800 text-slate-200 rounded-bl-none shadow-xl'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.role !== 'user' && (msg.pinyin || msg.translation) && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                        {msg.pinyin && <p className="text-orange-400 font-mono text-[11px] bg-orange-400/5 p-2 rounded-lg leading-loose">{msg.pinyin}</p>}
                        {msg.translation && <p className="text-emerald-400 italic text-[12px] bg-emerald-400/5 p-2 rounded-lg">"{msg.translation}"</p>}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-600 mt-2 font-black px-2">{msg.time}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChatHistory;