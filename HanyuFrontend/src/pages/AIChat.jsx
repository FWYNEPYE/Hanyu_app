import React, { useState, useEffect, useRef } from 'react';
import { 
  HiPaperAirplane, HiX, HiChatAlt2, HiChevronDown, 
  HiPencilAlt, HiMicrophone, HiPlus, HiClock, HiChevronRight
} from "react-icons/hi";

const AIChat = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('chat'); 
  const [showMenu, setShowMenu] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' hoặc 'correct'
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // ---  LỊCH SỬ ---
const loadChatHistory = async () => {
    const currentUserId = localStorage.getItem("userId") || 7;
    try {
        const response = await fetch(`http://localhost:5252/api/AI/history/${currentUserId}`); 
        if (response.ok) {
            const data = await response.json();
            if(data.length > 0) {
               setMessages(data.map(m => ({
                 id: m.id, 
                 role: m.role.toLowerCase(), 
                 text: m.content, 
                 pinyin: m.pinyin, 
                 translation: m.translation
               })));
            }
        }
    } catch (e) { console.log("Lỗi khi load lịch sử"); }
};

useEffect(() => {
    loadChatHistory();
}, []);



  // --- GỢI Ý THEO TRANG ---
  useEffect(() => {
    if (!currentPage || view !== 'chat') return;
    const getHint = async () => {
      try {
        const res = await fetch('http://localhost:5252/api/AI/context-hint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPage })
        });
        const data = await res.json();
        if (data && data.text) {
          setMessages(prev => {
            if (prev.some(m => m.text === data.text)) return prev;
            return [...prev, { id: Date.now(), role: 'ai', ...data }];
          });
        }
      } catch (e) { console.error("Lỗi hint:", e); }
    };
    getHint();
  }, [currentPage]);

  useEffect(() => {
    if (isOpen && view === 'chat') scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, view]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // LẤY ID ĐỘNG TỪ LOCALSTORAGE
    const currentUserId = localStorage.getItem("userId") || 7; // Mặc định là 7 nếu chưa có

    const userMsg = { id: Date.now(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    const messageToSend = inputText;
    setInputText('');
    setIsLoading(true);

    try {
        const response = await fetch('http://localhost:5252/api/AI/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(currentUserId), message: messageToSend })
        });

        if (response.ok) {
            const data = await response.json();
            setMessages(prev => [...prev, { 
                id: data.id, 
                role: 'ai', 
                text: data.content, 
                pinyin: data.pinyin, 
                translation: data.translation 
            }]);
        }
    } catch (e) {
        console.error("Lili đang bận!", e);
    } finally {
        setIsLoading(false);
    }
  };
  const startListening = () => {
    // Kiểm tra trình duyệt
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Trình duyệt của mày không hỗ trợ giọng nói rồi!");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN'; // Hoặc 'zh-CN' nếu mày muốn nói tiếng Trung trực tiếp
    recognition.continuous = false;

    recognition.onstart = () => {
        setIsLoading(true); // Mượn cái loading để báo hiệu đang nghe
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript); // Đổ chữ vừa nói vào ô Input
    };

    recognition.onerror = (event) => {
        console.error("Lỗi thu âm:", event.error);
    };

    recognition.onend = () => {
        setIsLoading(false);
    };

    recognition.start();
};

  const startNewChat = () => {
    setMessages([{ id: Date.now(), role: 'ai', text: 'Chào mày! Tao là Lili, muốn học gì nào? ✨', pinyin: 'Nǐ hǎo!', translation: 'Chào bạn!' }]);
    setView('chat');
    setMode('chat');
    setShowMenu(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999] pointer-events-none">
      {isOpen && (
        <div className="absolute bottom-20 right-2 w-[90vw] sm:w-[380px] h-[550px] max-h-[80vh] bg-white rounded-[35px] shadow-[0_20px_60px_rgba(255,82,82,0.3)] border-2 border-[#ffeadb] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
          
          <header className="px-5 py-4 bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] shrink-0 shadow-md relative z-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 relative">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border-2 border-white transform -rotate-3 overflow-hidden">
                  <img src="https://api.dicebear.com/8.x/bottts-neutral/svg?seed=Lili" alt="bot" />
                </div>
                
                <div className="cursor-pointer" onClick={() => setShowMenu(!showMenu)}>
                  <div className="flex items-center gap-1">
                    <h2 className="font-black text-white text-[15px]">
                      {view === 'list' ? 'Lịch sử' : (mode === 'chat' ? 'Hehe' : 'Sửa lỗi câu')}
                    </h2>
                    <HiChevronDown className={`text-white transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* --- MENU CON --- */}
                {showMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowMenu(false)}></div>
                    <div className="absolute top-12 left-0 w-48 bg-white rounded-2xl shadow-2xl border border-[#ffeadb] py-2 z-[60] animate-in zoom-in-95">
                      <button onClick={startNewChat} className="w-full flex items-center gap-2 px-4 py-2 text-[12px] text-[#ff416c] hover:bg-[#fff5f5] font-bold transition-colors"><HiPlus /> Chat mới</button>
                      <button onClick={() => {setView('list'); setShowMenu(false)}} className="w-full flex items-center gap-2 px-4 py-2 text-[12px] text-[#4a3230] hover:bg-[#fff5f5] font-bold transition-colors"><HiClock /> Lịch sử</button>
                      <div className="h-[1px] bg-[#fff5f0] my-2 mx-4"></div>
                      <button onClick={() => {setMode('chat'); setView('chat'); setShowMenu(false)}} className="w-full flex items-center gap-2 px-4 py-2 text-[12px] text-[#4a3230] hover:bg-[#fff5f5] font-bold transition-colors"><HiChatAlt2 /> Hội thoại tự do</button>
                      <button onClick={() => {setMode('correct'); setView('chat'); setShowMenu(false)}} className="w-full flex items-center gap-2 px-4 py-2 text-[12px] text-[#4a3230] hover:bg-[#fff5f5] font-bold transition-colors"><HiPencilAlt /> Sửa lỗi câu</button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {view === 'chat' && (
                  <>
                    <button onClick={() => setShowPinyin(!showPinyin)} className={`w-8 h-8 rounded-xl font-black text-[10px] flex items-center justify-center transition-all ${showPinyin ? 'bg-white text-[#ff416c] shadow-md' : 'bg-black/10 text-white/60'}`}>拼</button>
                    <button onClick={() => setShowTranslation(!showTranslation)} className={`w-8 h-8 rounded-xl font-black text-[10px] flex items-center justify-center transition-all ${showTranslation ? 'bg-white text-[#ff4b2b] shadow-md' : 'bg-black/10 text-white/60'}`}>文</button>
                  </>
                )}
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><HiX size={22}/></button>
              </div>
            </div>
          </header>

          {view === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-[#fffaf5] no-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-[24px] shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-[#ff416c] to-[#ff4b2b] text-white rounded-br-none' : 'bg-white text-[#4a3230] border border-[#ffeadb] rounded-bl-none'}`}>
                      {msg.role === 'ai' && showPinyin && <p className="text-[10px] text-[#ff4b2b] font-bold mb-1 opacity-80">{msg.pinyin}</p>}
                      {/* Chỗ hiện CHỮ HÁN (Dòng chữ to ở giữa) */}
                      <p className="text-[14px] font-medium leading-relaxed tracking-wide text-[#2d3436]">
                          {msg.text || msg.content} 
                      </p>
                      {msg.role === 'ai' && showTranslation && <div className="mt-2 pt-2 border-t border-[#fff5f0] text-[11px] text-[#8e7b79] italic">{msg.translation}</div>}
                    </div>
                  </div>
                ))}
                {isLoading && <div className="ml-2 text-[10px] text-gray-400 animate-bounce">Lili đang check bài...</div>}
                <div ref={scrollRef} />
              </div>

              <div className="p-4 bg-white border-t-2 border-[#fff5f0]">
                <div className="flex items-center gap-3 bg-[#fdf2f0] rounded-full px-4 py-1.5 border-2 border-transparent focus-within:border-[#ff9068]">
                  <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={mode === 'chat' ? "Nhập tin nhắn..." : "Dán câu cần sửa vào đây..."} className="flex-1 bg-transparent border-none focus:ring-0 text-[13.5px] outline-none" />
                  <button 
    onClick={inputText.trim() ? handleSendMessage : startListening} 
    className={`transition-all ${!inputText.trim() ? 'hover:scale-125 text-blue-500' : 'text-[#ff416c]'}`}
>
    {inputText.trim() ? <HiPaperAirplane size={22} className="rotate-90" /> : <HiMicrophone size={22} />}
</button>
                </div>
              </div>
            </>
          ) : (
            /* VIEW LỊCH SỬ NHƯ CŨ */
            <div className="flex-1 overflow-y-auto bg-[#fffaf5] p-5 space-y-3">
              <p className="text-center text-[10px] font-bold text-gray-400">TẤT CẢ CUỘC TRÒ CHUYỆN</p>
              {/* Duyệt qua list lịch sử thật ở đây */}
              <div onClick={() => setView('chat')} className="p-4 bg-white rounded-3xl border border-[#ffeadb] flex items-center justify-between cursor-pointer hover:border-[#ff416c]">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#fff5f5] text-[#ff416c] flex items-center justify-center"><HiChatAlt2 size={20}/></div>
                    <h4 className="text-[13px] font-black text-[#4a3230]">Bài học gần nhất</h4>
                 </div>
                 <HiChevronRight className="text-[#ffeadb]" />
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setIsOpen(!isOpen)} className={`pointer-events-auto w-[60px] h-[60px] rounded-full shadow-lg flex items-center justify-center transition-all ${isOpen ? 'bg-white border-2 border-[#ff416c]' : 'bg-gradient-to-br from-[#ff416c] to-[#ff4b2b]'}`}>
        {isOpen ? <HiX size={30} className="text-[#ff416c]" /> : <HiChatAlt2 size={32} className="text-white" />}
      </button>
    </div>
  );
};

export default AIChat;