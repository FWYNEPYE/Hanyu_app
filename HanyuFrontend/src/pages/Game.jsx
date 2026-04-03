import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { 
  HiOutlineAcademicCap, HiOutlineDatabase, HiOutlineStar, 
  HiOutlineChevronDown, HiOutlineLightningBolt, HiOutlineRefresh,
  HiOutlineClipboardList, HiOutlinePuzzle, HiOutlinePencilAlt,
  HiOutlineVolumeUp, HiOutlineTrendingUp, HiOutlineCheck, HiOutlineX
} from "react-icons/hi";

// Import các Game con 
import GameMCQ from '../components/GameMCQ';
import GameFlashcard from '../components/GameFlashcard';
import GameMatch from '../components/GameMatch';
import GameType from '../components/GameType';
import GameListening from '../components/GameListening';
import GameMixed from '../components/GameMixed';
import SRSGame from '../components/SRSGame';

const API_BASE_URL = "http://localhost:5252/api";

const Game = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [gameData, setGameData] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [collections, setCollections] = useState([]); // Chứa bộ từ từ DB
  
  const [filters, setFilters] = useState({
    category: '', // categoryID
    limit: '20'
  });

  // Lấy danh sách Bộ từ 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/Category`);
        setCollections(res.data);
        if (res.data.length > 0) {
          setFilters(prev => ({ ...prev, category: res.data[0].categoryID.toString() }));
        }
      } catch (err) {
        console.error("Lỗi fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  //  Logic xử lý bắt đầu Game
  const handleStartGame = async (gameId) => {
    setIsLoading(true);
    try {
      
      const res = await axios.get(`${API_BASE_URL}/Vocabulary`);
      
      // Lọc theo CategoryID đã chọn
      let filtered = res.data.filter(v => v.categoryID.toString() === filters.category.toString());

      if (filtered.length === 0) {
        alert("Bộ từ này đang trống, mày sang trang Từ vựng thêm vài từ đã!");
        return;
      }

      // Trộn ngẫu nhiên và giới hạn số lượng câu
      const limitNum = parseInt(filters.limit);
      const shuffled = filtered.sort(() => 0.5 - Math.random());
      const finalData = shuffled.slice(0, limitNum);

      setGameData(finalData);
      setSelectedGame(gameId);
      window.is_playing = true;
    } catch (error) {
      alert("Lỗi kết nối dữ liệu!");
    } finally {
      setIsLoading(false);
    }
  };

  const limits = [
    { id: '10', label: '10 Câu hỏi' },
    { id: '20', label: '20 Câu hỏi' },
    { id: '50', label: '50 Câu hỏi' },
    { id: '100', label: 'Cày nát bộ từ' },
  ];

  const gameModes = [
    { id: 'flashcard', title: "Flashcard", desc: "Lật thẻ thần tốc", icon: HiOutlineClipboardList, color: "from-purple-500 to-indigo-600", bgColor: "bg-[#F3E8FF]" },
    { id: 'mcq', title: "Trắc nghiệm", desc: "Chọn đáp án đúng", icon: HiOutlineAcademicCap, color: "from-orange-400 to-red-500", bgColor: "bg-[#FFF7ED]" },
    { id: 'match', title: "Nối từ", desc: "Ghép đôi siêu tốc", icon: HiOutlinePuzzle, color: "from-blue-400 to-blue-700", bgColor: "bg-[#EFF6FF]" },
    { id: 'type', title: "Gõ từ", desc: "Viết chuẩn Hanzi", icon: HiOutlinePencilAlt, color: "from-green-400 to-emerald-600", bgColor: "bg-[#ECFDF5]" },
    { id: 'listen', title: "Nghe viết", desc: "Luyện tai bản xứ", icon: HiOutlineVolumeUp, color: "from-cyan-400 to-blue-500", bgColor: "bg-[#ECFEFF]" },
    { id: 'mix', title: "Game tổng hợp", desc: "Thách thức cực hạn", icon: HiOutlineLightningBolt, color: "from-pink-500 to-rose-600", isHot: true, bgColor: "bg-[#FFF1F2]" },
  ];

  const getSelectedLabel = (type) => {
    if (type === 'category') {
      const found = collections.find(c => c.categoryID.toString() === filters.category);
      return found ? found.categoryName : "Chọn bộ từ";
    }
    return limits.find(lim => lim.id === filters.limit)?.label;
  };

  const CustomDropdown = ({ label, type, options }) => {
    const isOpen = openDropdown === type;
    const currentLabel = getSelectedLabel(type);

    return (
      <div className="relative flex-1 w-full">
        <p className="ml-4 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <button 
          onClick={() => setOpenDropdown(isOpen ? null : type)}
          className={`w-full bg-white border-2 h-[52px] sm:h-[64px] px-4 sm:px-5 rounded-[20px] flex items-center justify-between transition-all duration-300
            ${isOpen ? 'border-red-500 shadow-lg ring-4 ring-red-50' : 'border-gray-50 shadow-sm'}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="shrink-0">
                {type === 'category' ? <HiOutlineDatabase className="text-purple-500" /> : <HiOutlineRefresh className="text-blue-500" />}
            </span>
            <span className="font-black text-gray-700 text-xs sm:text-sm truncate">{currentLabel}</span>
          </div>
          <HiOutlineChevronDown className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-red-500' : 'text-gray-400'}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[45]" onClick={() => setOpenDropdown(null)} />
            <div className="absolute top-[105%] left-0 w-full bg-white border border-gray-100 rounded-[24px] shadow-2xl z-[50] py-2 max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => {
                    setFilters({...filters, [type]: opt.id.toString()});
                    setOpenDropdown(null);
                  }}
                  className={`px-6 py-3 flex items-center justify-between group cursor-pointer transition-all mx-2 rounded-[16px]
                    ${filters[type] === opt.id.toString() ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="font-bold text-xs sm:text-sm truncate">{opt.label}</span>
                  {filters[type] === opt.id.toString() && <HiOutlineCheck className="text-red-500 shrink-0" />}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Logic render màn hình Game hoặc Menu
  if (selectedGame) {
    const commonProps = { 
      data: gameData,
      onBack: () => { setSelectedGame(null); window.is_playing = false; } 
    };
    
    const GameComponents = {
        mcq: GameMCQ,
        flashcard: GameFlashcard,
        match: GameMatch,
        type: GameType,
        listen: GameListening,
        mix: GameMixed,
        srs: SRSGame
    };

    const SpecificGame = GameComponents[selectedGame];
    return <SpecificGame {...commonProps} filters={selectedGame === 'srs' ? filters : undefined} />;
  }

  return (
         <div className="max-w-7xl mx-auto px-4 space-y-6 animate-in fade-in duration-700 pb-20 overflow-x-hidden">
        {isLoading && (
          <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="font-black text-red-600 animate-pulse uppercase">Đợi xíu nhaa...</p>
            </div>
          </div>
        )}

        {/* <div className="text-center space-y-1 pt-4 sm:pt-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter uppercase">
            Thử thách <span className="text-red-600 underline decoration-red-100">Kỹ năng</span>
          </h1>
        </div> */}

        <div className="relative z-[40] flex flex-col sm:flex-row gap-4 bg-white/40 backdrop-blur-md p-2 sm:p-5 rounded-[25px] sm:rounded-[35px] border border-white shadow-lg max-w-6xl mx-auto">
          <div className="flex-1">
            <CustomDropdown 
                label="Bộ từ vựng" 
                type="category" 
                options={collections.map(c => ({ id: c.categoryID, label: c.categoryName }))} 
            />
          </div>
          <div className="flex-1">
            <CustomDropdown label="Số lượng câu hỏi" type="limit"  options={limits}  />
          </div>
        </div>



      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10">
        {gameModes.map((mode) => (
          <div key={mode.id} onClick={() => handleStartGame(mode.id)} className="group relative cursor-pointer">
            <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} rounded-[30px] sm:rounded-[50px] blur-2xl opacity-0 group-hover:opacity-10 transition-all duration-500`} />
            <div className={`relative ${mode.bgColor} border border-white/50 rounded-[30px] sm:rounded-[50px] p-5 sm:p-10 h-full flex flex-col items-center text-center transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-2xl`}>
              <div className={`w-14 h-14 sm:w-24 sm:h-24 mb-4 sm:mb-8 rounded-[20px] sm:rounded-[35px] bg-gradient-to-br ${mode.color} flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-all duration-500`}>
                <mode.icon className="text-2xl sm:text-5xl" />
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-gray-800 mb-1 sm:mb-3">{mode.title}</h3>
              <p className="text-[10px] sm:text-sm text-gray-500 font-medium mb-6 sm:mb-10 px-1 italic leading-tight">{mode.desc}</p>
              <div className="mt-auto w-full py-3 sm:py-4.5 rounded-[15px] sm:rounded-[25px] bg-white/60 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-white/40">
                Bắt đầu <HiOutlineTrendingUp className="text-xs sm:text-base" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SRS Section */}
      <div className="relative z-10 bg-gray-900 rounded-[40px] sm:rounded-[60px] p-8 sm:p-14 text-white overflow-hidden shadow-2xl transition-transform hover:scale-[1.01]">
        <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10">
          <div className="text-center lg:text-left space-y-3">
            <div className="inline-block bg-red-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Smart Memory</div>
            <h2 className="text-2xl sm:text-4xl font-black italic tracking-tighter leading-tight">Ôn tập Ngắt quãng (SRS)</h2>
            <p className="text-xs sm:text-gray-400 max-w-xl font-medium">Luyện tập những từ khó dựa trên dữ liệu cá nhân của mày.</p>
          </div>
          <button onClick={() => setSelectedGame('srs')}
            className="w-full lg:w-auto bg-white text-gray-900 px-10 py-4 sm:px-14 sm:py-5 rounded-[20px] sm:rounded-[30px] font-black text-sm sm:text-lg hover:bg-red-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-4">
            ÔN TẬP <HiOutlineRefresh className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;