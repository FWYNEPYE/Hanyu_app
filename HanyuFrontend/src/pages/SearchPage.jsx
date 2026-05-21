import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  HiOutlineSearch, HiOutlineVolumeUp, HiOutlineSparkles, 
  HiOutlineBookOpen, HiOutlineMicrophone, HiOutlinePencilAlt, 
  HiOutlineTrash, HiX 
} from "react-icons/hi";

import HanziStroke from '../components/HanziStroke';
import SaveWordModal from '../components/SaveWord';
import VoiceSearch from '../components/VoiceSearch';
const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [showHandwriting, setShowHandwriting] = useState(false);
  const [handwritingSuggestions, setHandwritingSuggestions] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]); // Gợi ý khi gõ

  // const [isSaving, setIsSaving] = useState(false);
   const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canvasRef = useRef(null);
  const strokes = useRef([]); 
  const isDrawing = useRef(false);

  const skipNextSuggestion = useRef(false);
  // ---  LẤY USER ID TỪ LOCALSTORAGE ---
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user')); 
    return user ? user.id : 7; 
  };

  const [history, setHistory] = useState([]);

// Lấy lịch sử khi load trang
useEffect(() => {
  const savedHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
  setHistory(savedHistory);
}, []);


useEffect(() => {
  // Nếu trống thì dọn dẹp
  if (searchTerm.trim().length === 0) {
    setSearchSuggestions([]);
    setResult(null);
    return;
  }

  const isDesktop = window.innerWidth > 1024;
  //const isLongQuery = searchTerm.trim().length > 5;

  const fetchSuggestions = async () => {
 
    if (showHandwriting || skipNextSuggestion.current){
      setSearchSuggestions([]);
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:5252/api/Dictionary/suggestions`, {
        params: { keyword: searchTerm }
      });
      setSearchSuggestions(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setSearchSuggestions([]);
    }
  };

  const suggestionTimeout = setTimeout(fetchSuggestions, 200);

  // TỰ ĐỘNG SEARCH cho đt
  let searchTimeout;
  if (!isDesktop) {
    searchTimeout = setTimeout(() => {
      if (!showHandwriting && !skipNextSuggestion.current) {
        handleSearch(null, searchTerm);
        setSearchSuggestions([]); 
      }
      skipNextSuggestion.current = false;
    }, 2500);
  } else {
    if (skipNextSuggestion.current) {
      const releaseLock = setTimeout(() => {
        skipNextSuggestion.current = false;
        setSearchSuggestions([]); // Ép xóa 
      }, 500); 
      return () => {
        clearTimeout(suggestionTimeout);
        clearTimeout(releaseLock);
      };
    }
  }

  return () => {
    clearTimeout(suggestionTimeout);
    if (searchTimeout) clearTimeout(searchTimeout);
  };
}, [searchTerm, showHandwriting]);
  
  // --- LOGIC CANVAS ---
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: Math.round((clientX - rect.left) * scaleX), y: Math.round((clientY - rect.top) * scaleY) };
  };

  const startDrawing = (e) => {
    isDrawing.current = true;
    const { x, y } = getCoordinates(e);
    strokes.current.push([[x], [y], [Date.now()]]); 
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#475569'; 
    ctx.beginPath(); ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    const currentStroke = strokes.current[strokes.current.length - 1];
    currentStroke[0].push(x); currentStroke[1].push(y); currentStroke[2].push(Date.now());
    ctx.lineTo(x, y); ctx.stroke();
  };

  const stopDrawing = () => { isDrawing.current = false; sendToRecognition(); };

  const sendToRecognition = async () => {
    if (strokes.current.length === 0) return;
    try {
      const res = await axios.post('https://www.google.com.tw/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8', {
        options: "enable_pre_space",
        requests: [{ writing_guide: { writing_area_width: 800, writing_area_height: 500 }, ink: strokes.current, language: "zh-Hans" }]
      });
      if (res.data?.[1]?.[0]?.[1]) setHandwritingSuggestions(res.data[1][0][1]);
    } catch (err) { console.error(err); }
  };



const handleOpenSaveModal = () => {
    if (!result) return;
    setIsModalOpen(true);
};
  // --- HÀM SEARCH ---
  const handleSearch = async (e, forcedTerm) => {
    if (e) e.preventDefault();
    const query = forcedTerm || searchTerm;
    if (!query) return;


    setSearchSuggestions([]); 
    skipNextSuggestion.current = true; 
    setIsSearching(true);
    //setShowHandwriting(false);
    setResult(null);
    //mới
    setIsSaved(false);

   try {
    const response = await axios.get(`http://localhost:5252/api/Dictionary/search`, {
      params: { keyword: query, userId: getUserId() }
    });

    if(response.data) {
      setResult(response.data);

      // --- LƯU LỊCH SỬ TẠI ĐÂY ---
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newEntry = {
        hanzi: response.data.hanzi || query,
        pinyin: response.data.pinyin || response.data.Pinyin || "...",
        meaning: response.data.meaning || "..."
      };
      const updatedHistory = [newEntry, ...history.filter(h => h.hanzi !== newEntry.hanzi)].slice(0, 5);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    }
      else{
        console.log("Đợi xíu...");
      }



    } catch (error) {
      console.error("Lỗi:", error.response?.data);
      setResult(null);
    } finally { setIsSearching(false); }
    
  };
  const selectChar = (char) => {
    skipNextSuggestion.current = true;
    const updated = searchTerm + char;
    setSearchTerm(updated);
    clearCanvasOnly();
    handleSearch(null, updated); 
  };

  const clearCanvasOnly = () => {
    strokes.current = [];
    setHandwritingSuggestions([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };
  const speak = (text) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-CN';
    window.speechSynthesis.speak(msg);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10 space-y-2 pt-0 animate-in fade-in duration-500">
      
      {/* ---  SEARCH BAR --- */}
      <div className="text-center space-y-4 pt-6">
        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto mt-0 group">
          
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
            <HiOutlineSearch size={24} />
          </div>
          
          <input 
            type="text" 
            value={searchTerm}
             onChange={(e) => {
              skipNextSuggestion.current = false; 
              setSearchTerm(e.target.value);
            }}
            placeholder="Nhập Hán tự, Pinyin..."
            className="w-full p-5 pl-14 pr-32 rounded-full border-2 border-white bg-white shadow-xl focus:border-red-500 outline-none transition-all text-base md:text-lg"
            autoComplete="off"/>

          {/* --- DROP DOWN GỢI Ý --- */}
          {searchSuggestions.length > 0 && !showHandwriting && (
            <div className="absolute top-[105%] left-0 w-full bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[150] animate-in fade-in slide-in-from-top-2">
              <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {searchSuggestions.map((item, i) => (
                  <div 
                    key={i}
                    onClick={() => {
                      skipNextSuggestion.current = true; 
                      setSearchTerm(item.hanzi);
                      setSearchSuggestions([]);
                      handleSearch(null, item.hanzi);
                    }}
                    className="px-6 py-3.5 flex items-baseline gap-3 hover:bg-slate-50 cursor-pointer border-b border-gray-50 last:border-none group text-left"
                  >
                    <div className="flex items-baseline gap-1 min-w-fit">
                      <span className="text-xl font-medium text-[#000000] group-hover:scale-110 transition-transform"> {item.hanzi}  </span>
                      {item.traditional && item.traditional !== item.hanzi && (<span className="text-gray-400 text-sm">/ {item.traditional}</span>)}
                    </div>
                    <div className="text-[#2d3436] font-bold text-[15px] whitespace-nowrap">【{item.pinyin}】</div>
                    <div className="text-gray-500 text-[14px] font-medium truncate flex-1 text-left">{item.meaning}</div>

                    {/* <HiOutlineSearch className="text-gray-200 group-hover:text-red-400" size={16} /> */}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-l pl-3 border-gray-100">
  
            {/* Component Voice */}
            <VoiceSearch 
              onTranscript={(text) => setSearchTerm(text)} 
              onSearch={(text) => handleSearch(null, text)} 
            />

            <button 
              type="button" 
              onClick={() => {
                setShowHandwriting(!showHandwriting);
                setSearchSuggestions([]); 
              }}
              className={`p-2 transition-colors ${showHandwriting ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
            >
              <HiOutlinePencilAlt size={22} />
            </button>
          </div>

          {/* BOX VẼ */}
          {showHandwriting && (
            <div className="absolute top-[110%] left-0 w-full bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 flex flex-col">
              <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50/50 min-h-[70px] border-b items-center px-6">
                {handwritingSuggestions.map((char, i) => (
                  <button key={i} type="button" onClick={() => selectChar(char)} className="min-w-[45px] h-[45px] bg-white border border-gray-200 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center justify-center text-lg">
                    {char}
                  </button>
                ))}
              </div>
              <canvas 
                ref={canvasRef} width={800} height={400} 
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                className="w-full h-[250px] bg-slate-50/50 cursor-crosshair"
              />
              <div className="px-6 py-3 bg-gray-50 flex justify-between">
                <button type="button" onClick={clearCanvasOnly} className="text-xs font-black text-gray-400 hover:text-red-500 flex items-center gap-1 uppercase"><HiOutlineTrash /> Xóa</button>
                <button type="button" onClick={() => {skipNextSuggestion.current = true; setShowHandwriting(false);handleSearch(null, searchTerm);}} className="text-xs font-black text-gray-400 hover:text-gray-700 uppercase">Đóng</button>
              </div>
            </div>
          )}
        </form>
      </div>
      {!result && !isSearching && (
        <div className="mt-12 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-700">
          
          {/* Hiển thị List nếu có lịch sử */}
          {localStorage.getItem('searchHistory') && JSON.parse(localStorage.getItem('searchHistory')).length > 0 && (
            <div className="bg-white/40 backdrop-blur-md rounded-[35px] border border-white/60 shadow-xl overflow-hidden mb-12">
              <div className="px-8 py-4 border-b border-slate-100/50 flex justify-between items-center bg-white/20">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Lịch sử</span>
                <button 
                  onClick={() => { localStorage.removeItem('searchHistory'); window.location.reload(); }}
                  className="text-[10px] font-bold text-slate-300 hover:text-red-500 transition-colors uppercase"
                >
                  Dọn dẹp
                </button>
              </div>

              <div className="divide-y divide-slate-100/50">
                {JSON.parse(localStorage.getItem('searchHistory')).map((item, index) => (
                  <div 
                    key={index}
                    onClick={() => {
                      setSearchTerm(item.hanzi);
                      handleSearch(null, item.hanzi);
                    }}
                    className="group px-8 py-5 flex items-center gap-6 hover:bg-white/60 cursor-pointer transition-all"
                  >
                    <div className="text-2xl font-black text-slate-800 group-hover:text-red-600 transition-colors min-w-[70px] text-left">
                      {item.hanzi}
                    </div>
                    <div className="text-sm font-bold text-blue-500 font-mono min-w-[110px] text-left">
                      [{item.pinyin}]
                    </div>
                    <div className="flex-1 text-sm text-slate-500 font-medium truncate group-hover:text-slate-800 transition-colors text-left">
                      {item.meaning}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-red-400">
                      <HiOutlineSearch size={18} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ---form kết quả --- */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl flex flex-col items-center justify-center min-h-[350px] overflow-hidden">
                <h1 className="text-3xl font-black text-[#2d3436] mb-3 tracking-tight text-center break-words w-full">
                  {result?.hanzi || searchTerm}
                </h1>

                <div className="text-xl font-bold text-gray-400 mb-10 text-center px-4">
                  {isSearching ? (
                    <span className="animate-pulse text-blue-400 font-medium">AI đang phân tích...</span>
                  ) : (
                    <span className="text-blue-500 tracking-wide">
        
                      [ {result?.pinyin || result?.Pinyin || "pīnyīn"} ]
                    </span>
                  )}
                </div>

                <button 
                  type="button"
                  onClick={() => speak(result?.hanzi || searchTerm)} 
                  className="w-full py-4 bg-red-50 text-red-600 rounded-full font-black flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm group"
                >
                  <HiOutlineVolumeUp size={22} className="group-hover:animate-pulse" />
                  <span className="uppercase tracking-[0.2em] text-xs">Nghe</span>
                </button>
            </div>
            <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm">
                <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4 flex items-center gap-2">
                  <HiOutlinePencilAlt className="text-blue-500" size={18} /> Hướng dẫn viết
                </h4>
                
                <div className="min-h-[250px] flex items-center justify-center bg-slate-50/50 rounded-3xl p-4 border-2 border-dashed border-gray-100">
                
                  {(result?.hanzi || searchTerm) ? (
                    <HanziStroke text={result?.hanzi || searchTerm} />
                    ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-400 font-bold uppercase">Nhập từ để xem cách viết</p>
                    </div>
                  )}
                </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-600">
                    <HiOutlineSparkles size={22} />
                    <span className="font-black uppercase tracking-widest text-[10px]">AI Phân tích chi tiết</span>
                </div>
                
               <button
                    onClick={() => setIsModalOpen(true)} // Mở modal thay vì gọi hàm lưu trực tiếp
                    disabled={isSaved}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all shadow-sm
                        ${isSaved 
                            ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                            : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95'}`}
                >
                    {isSaved ? "✓ Đã lưu" : "+ Thêm vào bộ từ"}
                </button>
              </div>
              
             
              <div className="flex flex-wrap gap-2 mb-2">
                {result.type && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">
                    {result.type}
                  </span>
                )}
                {/* Bạn có thể thêm các nhãn khác ở đây, chúng sẽ nằm cùng hàng với Type */}
              </div>

              {/* Khối phân tích bộ thủ nằm riêng biệt ở dưới */}
              {result.radical && (
                <div 
                  className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg text-[13px] font-medium leading-relaxed" 
                  style={{ whiteSpace: 'pre-line' }}
                >
                  <strong className="block mb-1 text-[10px] font-black uppercase opacity-70">
                    Phân tích bộ thủ:
                  </strong>
                  {result.radical}
                </div>
              )}
        

              <h3 className="text-xl font-black mb-3 text-[#2d3436]">{result.meaning}</h3>
              {/* <p className="text-gray-500 leading-relaxed text-base font-medium mb-6">"{result.definition || 'Đang cập nhật định nghĩa chi tiết...'}"</p> */}
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <h4 className="font-black text-blue-700 text-[11px] uppercase mb-2 tracking-wider">Điểm ngữ pháp:</h4>
                <p className="text-blue-800/70 text-sm font-medium leading-relaxed">{result.grammar}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-green-500 mb-5">
                <HiOutlineBookOpen size={22} />
                <span className="font-black uppercase tracking-widest text-[10px]">Ví dụ minh họa</span>
              </div>
              <div className="space-y-4">
                {result.example ? (
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                    <p className="text-xl font-bold text-[#2d3436]">{result.example}</p>
                    <p className="text-gray-400 text-base font-medium mt-1">{result.exampleMeaning}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Chưa có ví dụ.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <SaveWordModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          wordData={result}
          userId={getUserId()}
          onSaved={() => setIsSaved(true)} 
      />
    </div>
  );
  
};

export default SearchPage;