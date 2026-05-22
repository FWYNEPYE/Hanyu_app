import React, { useState, useEffect, useRef } from 'react';
import { 
  HiPaperAirplane, HiX, HiChatAlt2, HiChevronDown, 
  HiMicrophone, HiPlus, HiClock, HiChevronRight
} from "react-icons/hi";

const AIChat = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('chat'); 
  const [showMenu, setShowMenu] = useState(false);
  
  const [showPinyin, setShowPinyin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // 🎯 Quản lý trạng thái Mic chuẩn chỉ
  const [isListening, setIsListening] = useState(false); 
  const recognitionRef = useRef(null);
  const isStartedRef = useRef(false);

  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const loadSessions = async () => {
    const currentUserId = localStorage.getItem("userId") || 7;
    try {
        const response = await fetch(`/api/AI/sessions/${currentUserId}`); 
        if (response.ok) {
            const data = await response.json();
            setSessions(data); 
        }
    } catch (e) { console.log("Lỗi khi load danh sách session"); }
  };

  useEffect(() => {
      loadSessions();
  }, [isOpen]);

  // 🎙️ Khởi tạo cấu hình Mic một lần duy nhất khi App chạy
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;   
      rec.interimResults = false; 
      
      rec.lang = 'zh-CN'; 

      rec.onstart = () => {
        console.log("🔴 [Mic Log]: Trình duyệt bắt đầu MỞ MIC lắng nghe...");
        setIsListening(true);
        isStartedRef.current = true;
      };

      rec.onresult = (event) => {
        console.log("🎯 [Mic Log]: Đã nhận diện được âm thanh, đang xử lý...");
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          console.log("✅ [Mic Log] Chữ nhận được là:", transcript);
          setInputText(transcript); // Đổ chữ thẳng vào ô input
        }
      };

      rec.onerror = (event) => {
        console.error("❌ [Mic Log] Bị lỗi hệ thống:", event.error);
        if (event.error === 'not-allowed') {
          alert("Sếp ơi! Trình duyệt đang chặn quyền truy cập Mic rồi, bấm cho phép ở góc URL nhé!");
        }
        setIsListening(false);
        isStartedRef.current = false;
      };

      rec.onend = () => {
        console.log("⚪ [Mic Log]: Mic đã TỰ ĐỘNG ĐÓNG (User dừng nói hoặc timeout).");
        setIsListening(false);
        isStartedRef.current = false;
      };

      recognitionRef.current = rec;
    } else {
      console.error("❌ Trình duyệt này hoàn toàn không hỗ trợ Web Speech API.");
    }
  }, []);

  const selectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    try {
        setIsLoading(true);
        const response = await fetch(`/api/AI/history/session/${sessionId}`);
        if (response.ok) {
            const data = await response.json();
            setMessages(data.map(m => ({
                id: m.id, 
                role: m.role.toLowerCase(), 
                text: m.content, 
                pinyin: m.pinyin, 
                translation: m.translation
            })));
            setView('chat'); 
        }
    } catch (e) { console.error("Lỗi load tin nhắn:", e); }
    finally { setIsLoading(false); }
  };

  // --- GỢI Ý THEO TRANG ---
  useEffect(() => {
    if (!currentPage || view !== 'chat') return;
    const getHint = async () => {
      try {
        const res = await fetch('/api/AI/context-hint', {
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

    const currentUserId = localStorage.getItem("userId") || 7; 
    const messageToSend = inputText;

    const userMsg = { id: Date.now(), role: 'user', text: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
        const response = await fetch('/api/AI/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(currentUserId), message: messageToSend, SessionID: currentSessionId })
        });

        if (response.ok) {
            const data = await response.json();
            if (!currentSessionId && data.sessionId) setCurrentSessionId(data.sessionId);
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
    if (!recognitionRef.current) {
      alert("Trình duyệt không hỗ trợ giọng nói!");
      return;
    }

    // Nếu đang bật nói, bấm phát nữa sẽ chủ động ÉP DỪNG và lấy chữ luôn
    if (isStartedRef.current) {
      console.log("⏹️ [Mic Action]: Chủ động bấm dừng Mic để lấy chữ...");
      recognitionRef.current.stop();
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (ex) {
      console.log("Mic đang bận xử lý...", ex);
    }
  };

  const startNewChat = () => {
    setMessages([{ 
        id: Date.now(), 
        role: 'ai', 
        text: '你好! 我是Lili, 今天 we 们学什么呀? ✨', 
        pinyin: 'Nǐ hǎo! Wǒ shì Lili, jīntiān wǒmen xué shénme ya?', 
        translation: 'Chào! Mình là Lili, hôm nay chúng mình học gì nhỉ' 
    }]);
    setCurrentSessionId(null); 
    setView('chat');
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
                      {view === 'list' ? 'Lịch sử hội thoại' : 'Trò chuyện với Lili'}
                    </h2>
                    <HiChevronDown className={`text-white transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {showMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowMenu(false)}></div>
                    <div className="absolute top-12 left-0 w-48 bg-white rounded-2xl shadow-2xl border border-[#ffeadb] py-2 z-[60] animate-in zoom-in-95">
                      <button onClick={startNewChat} className="w-full flex items-center gap-2 px-4 py-2 text-[12px] text-[#ff416c] hover:bg-[#fff5f5] font-bold transition-colors"><HiPlus /> Chat mới</button>
                      <button onClick={() => {loadSessions(); setView('list'); setShowMenu(false)}} className="w-full flex items-center gap-2 px-4 py-2 text-[12px] text-[#4a3230] hover:bg-[#fff5f5] font-bold transition-colors"><HiClock /> Lịch sử</button>
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
                      <p className="text-[14px] font-medium leading-relaxed tracking-wide text-[#2d3436]">
                          {msg.text || msg.content} 
                      </p>
                      {msg.role === 'ai' && showTranslation && <div className="mt-2 pt-2 border-t border-[#fff5f0] text-[11px] text-[#8e7b79]">{msg.translation}</div>}
                    </div>
                  </div>
                ))}
                {isLoading && <div className="ml-2 text-[10px] text-gray-400 animate-bounce">Đợi xíu...</div>}
                <div ref={scrollRef} />
              </div>

              <div className="p-4 bg-white border-t-2 border-[#fff5f0]">
                <div className="flex items-center gap-3 bg-[#fdf2f0] rounded-full px-4 py-1.5 border-2 border-transparent focus-within:border-[#ff9068]">
                  <input 
                    type="text" 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                    placeholder="Nhập tin nhắn..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[13.5px] outline-none" 
                  />
                  
                  {inputText.trim() ? (
                    <button type="button" onClick={handleSendMessage} className="text-[#ff416c] hover:scale-110 transition-all">
                      <HiPaperAirplane size={22} className="rotate-90" />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={startListening} 
                      className={`transition-all duration-300 ${isListening ? 'text-red-500 scale-125 animate-pulse' : 'text-blue-500 hover:scale-110'}`}
                    >
                      <HiMicrophone size={22} />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto bg-[#fffaf5] p-5 space-y-3 no-scrollbar">
              <p className="text-center text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">
                Lịch sử trò chuyện
              </p>
              
              {sessions.length > 0 ? sessions.map((s) => (
                <div 
                  key={s.sessionId} 
                  onClick={() => selectSession(s.sessionId)}
                  className="p-4 bg-white rounded-3xl border border-[#ffeadb] flex items-center justify-between cursor-pointer hover:border-[#ff416c] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#fff5f5] text-[#ff416c] flex items-center justify-center group-hover:bg-[#ff416c] group-hover:text-white transition-colors">
                      <HiChatAlt2 size={20}/>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-[13px] font-black text-[#4a3230] truncate">{s.title}</h4>
                      <p className="text-[10px] text-gray-400">
                        {new Date(s.lastMessageAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <HiChevronRight className="text-[#ffeadb] group-hover:text-[#ff416c]" />
                </div>
              )) : (
                <div className="text-center py-10 text-gray-400 text-sm italic">
                  Chưa có cuộc trò chuyện nào...
                </div>
              )}
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