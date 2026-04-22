import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { RefreshCcw } from 'lucide-react';

const CommunityChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const myId = localStorage.getItem('userId');

const fetchMessages = async () => {
  try {
    const res = await axios.get('http://localhost:5252/api/social/messages');
    setMessages(res.data);
  } catch (error) {
    console.error("Lỗi lấy tin nhắn", error);
  }
};

useEffect(() => {
  fetchMessages();
  const interval = setInterval(fetchMessages, 2000); 
  return () => clearInterval(interval);
}, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      if (isAtBottom) setShowScrollBtn(false);
    }
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Tính toán vị trí trước khi nội dung mới được render
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
      const lastMessageIsMe = messages.length > 0 && String(messages[messages.length - 1].userId) === String(myId);

      if (isAtBottom || lastMessageIsMe) {
        container.scrollTop = container.scrollHeight;
        setShowScrollBtn(false);
      } else {
        setShowScrollBtn(true);
      }
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e.key === 'Enter' && inputText.trim()) {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        await axios.post('http://localhost:5252/api/social/send-message', 
          { content: inputText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInputText("");
        fetchMessages(); 
      } catch (err) {
        alert("Gửi tin nhắn thất bại!");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-[30px] border-2 border-orange-100 shadow-sm overflow-hidden flex flex-col h-[450px] font-sans">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
          overflow-anchor: none !important; 
        }
        .break-word { word-break: break-word; overflow-wrap: anywhere; }
      `}</style>

      {/* HEADER */}
      <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center shrink-0">
        <h3 className="font-black text-orange-700 text-sm flex items-center gap-2">
          <span className="animate-bounce">💬</span> Chat Cộng Đồng
        </h3>
        
        <button onClick={fetchMessages} disabled={loading} className="p-2 rounded-xl bg-rose-50 hover:bg-rose-500 group transition-all border border-rose-100">
          <RefreshCcw className={`w-4 h-4 text-rose-500 group-hover:text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="relative flex-1 overflow-hidden flex flex-col"> 
        <div 
          ref={scrollRef} 
          onScroll={handleScroll}
          className="p-2 flex flex-col gap-3 overflow-y-auto flex-1 bg-[#fafafa] hide-scrollbar"
        >
          {messages.map((m, i) => {
            const isMe = String(m.userId) === String(myId);
            return (
              <div key={i} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="shrink-0">
                  {m.avatar ? (
                    <img src={m.avatar} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" alt="avt" />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${isMe ? 'bg-orange-500 text-white' : 'bg-white text-orange-600 border border-orange-100'}`}>
                      {m.user?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className={`flex flex-col min-w-0 max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`flex gap-2 items-center mb-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="font-bold text-[10px] text-gray-800">{m.user}</span>
                    <span className="text-[8px] text-gray-400">
                      {formatDistanceToNow(new Date(m.time), { addSuffix: true, locale: vi })}
                    </span>
                  </div>
                  <div className={`text-sm p-3 rounded-2xl shadow-sm border break-word leading-relaxed ${isMe ? 'bg-orange-500 text-white border-orange-400 rounded-tr-none' : 'bg-white text-gray-700 border-gray-100 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* NÚT BÁO TIN MỚI */}
        {showScrollBtn && (
          <button 
            onClick={() => {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              setShowScrollBtn(false);
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-4 py-2 rounded-full shadow-lg text-[10px] font-bold flex items-center gap-2 animate-bounce z-10"
          >
            Có tin nhắn mới 👇
          </button>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-3 border-t border-orange-50 bg-white shrink-0">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleSendMessage}
          disabled={loading}
          placeholder={loading ? "Đang gửi..." : "Nhắn gì đó ..."} 
          className="w-full p-3 bg-gray-50 rounded-2xl text-[13px] border-2 border-transparent focus:border-orange-200 focus:bg-white outline-none transition-all placeholder:text-gray-300 shadow-inner"
        />
      </div>
    </div>
  );
};

export default CommunityChat;