import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { 
  HiOutlineAcademicCap, HiOutlineDatabase, HiOutlineChevronDown, 
  HiOutlineLightningBolt, HiOutlineRefresh, HiOutlineClipboardList, 
  HiOutlinePuzzle, HiOutlinePencilAlt, HiOutlineVolumeUp, 
  HiOutlineTrendingUp, HiOutlineCheck, HiOutlineCollection, HiOutlineCloudDownload,
  HiOutlineMap // Thêm icon lộ trình cho trực quan sếp nhé
} from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [gameData, setGameData] = useState([]); 
  const [fullCategoryData, setFullCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const [collections, setCollections] = useState([]); // Chứa bộ từ từ DB

  const [filters, setFilters] = useState({
    source: 'personal', // 'personal', 'purchased' hoặc 'roadmap'
    category: '', 
    limit: '20'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const res = await axios.get(`${API_BASE_URL}/Category/user/${userId}`); 
        setCollections(res.data);
        
        // Mặc định chọn bộ đầu tiên của cá nhân khi vừa vào trang
        const firstPersonal = res.data.find(c => c.categoryType === 'user' && !c.parentCategoryID);
        if (firstPersonal) {
          setFilters(prev => ({ ...prev, category: firstPersonal.categoryID.toString() }));
        }
      } catch (err) {
        console.error("Lỗi fetch:", err);
      }
    };
    fetchCategories();
  }, []);

  // 🎯 TẬP TRUNG XỬ LÝ LỌC BỘ TỪ THEO 3 NGUỒN KHÁC NHAU Ở ĐÂY:
 const filteredCollections = collections.filter(c => {
  // Phòng thủ đọc thuộc tính viết Hoa hay viết Thường từ DB/API nhả ra
  const type = (c.categoryType || c.CategoryType || '').toLowerCase();
  const borrowed = c.isBorrowed === true || c.IsBorrowed === true;

  if (filters.source === 'personal') {
    return (type === 'user') && !borrowed;
  } else if (filters.source === 'purchased') {
    return borrowed;
  } else if (filters.source === 'roadmap') {
    // Nhận diện cả chữ "system" đã được ép format hoặc chữ "hsk" gốc
    return type === 'system' || type === 'hsk';
  }
  return true;
});
  // Logic xử lý bắt đầu Game
  const handleStartGame = async (gameId) => {
    if (!filters.category) {
        alert("Sếp chọn bộ từ đã nhé!");
        return;
    }
    setIsLoading(true);
    try {
        const res = await axios.get(`${API_BASE_URL}/Vocabulary/category/${filters.category}`);
        
        if (!res.data || res.data.length === 0) {
            alert("Bộ từ này trống trơn hà!");
            return;
        }

        setFullCategoryData(res.data); 

        const limitNum = parseInt(filters.limit);
        const shuffled = [...res.data].sort(() => 0.5 - Math.random());
        
        // Chỉ lấy số lượng từ giới hạn để làm câu hỏi
        setGameData(shuffled.slice(0, limitNum));
        setSelectedGame(gameId);
        window.is_playing = true;
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Không lấy được dữ liệu!");
    } finally {
        setIsLoading(false);
    }
  };

  // 📝 BỔ SUNG OPTION LỘ TRÌNH ĐANG HỌC VÀO DANH SÁCH KHAI BÁO
  const sourceOptions = [
    { id: 'personal', label: 'Bộ từ cá nhân', icon: HiOutlineCollection },
    { id: 'roadmap', label: 'Lộ trình đang học', icon: HiOutlineMap },
    { id: 'purchased', label: 'Bộ từ cộng đồng', icon: HiOutlineCloudDownload },
  ];

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

  const getSourceIcon = () => {
    const currentSource = sourceOptions.find(s => s.id === filters.source);
    return currentSource ? currentSource.icon : HiOutlineCollection;
  };

  const getSelectedLabel = (type) => {
    if (type === 'source') return sourceOptions.find(s => s.id === filters.source)?.label || 'Bộ từ cá nhân';
    if (type === 'category') {
      const found = collections.find(c => c.categoryID.toString() === filters.category);
      return found ? found.categoryName : "--- Chọn bộ từ ---";
    }
    return limits.find(lim => lim.id === filters.limit)?.label;
  };

  const CustomDropdown = ({ label, type, options, icon: DefaultIcon }) => {
    const isOpen = openDropdown === type;
    const currentLabel = getSelectedLabel(type);

    return (
      <div className="relative flex-1">
        <p className="ml-4 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <button 
          onClick={() => setOpenDropdown(isOpen ? null : type)}
          className={`w-full bg-white border-2 h-[60px] px-4 rounded-[22px] flex items-center justify-between transition-all
            ${isOpen ? 'border-indigo-500 shadow-lg' : 'border-slate-100'}`}
        >
          <div className="flex items-center gap-2 overflow-hidden text-left">
            <DefaultIcon className="text-indigo-500 shrink-0" size={18} />
            <span className="font-bold text-slate-700 text-xs sm:text-sm truncate">{currentLabel}</span>
          </div>
          <HiOutlineChevronDown className={`shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-[110%] left-0 w-full bg-white border border-slate-100 rounded-[20px] shadow-2xl z-[100] py-2 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <div 
                key={opt.id}
                onClick={() => {
                  if (type === 'source') {
  const tempFiltered = collections.filter(c => {
    const cType = (c.categoryType || c.CategoryType || '').toLowerCase();
    const borrowed = c.isBorrowed === true || c.IsBorrowed === true;

    if (opt.id === 'personal') return cType === 'user' && !borrowed;
    if (opt.id === 'purchased') return borrowed;
    if (opt.id === 'roadmap') return cType === 'system' || cType === 'hsk';
    return true;
  });
  
  // Tránh lỗi undefined khi đọc categoryID hoặc CategoryID
  const nextCategory = tempFiltered.length > 0 
    ? (tempFiltered[0].categoryID || tempFiltered[0].CategoryID || '').toString() 
    : '';

  setFilters({ 
    source: opt.id, 
    category: nextCategory, 
    limit: filters.limit 
  });
}else {
                    setFilters({ ...filters, [type]: opt.id.toString() });
                  }
                  setOpenDropdown(null);
                }}
                className={`px-5 py-3 flex items-center justify-between mx-2 rounded-[15px] cursor-pointer
                  ${filters[type] === opt.id.toString() ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                <span className="font-bold text-sm">{opt.label}</span>
                {filters[type] === opt.id.toString() && <HiOutlineCheck />}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Logic render màn hình Game hoặc Menu
  if (selectedGame) {
    const commonProps = { 
      data: gameData, 
      allVocabs: fullCategoryData,
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
    return (
      <div className="flex-1 min-w-0 min-h-screen bg-white relative">
        <SpecificGame {...commonProps} filters={selectedGame === 'srs' ? filters : undefined} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 space-y-10 animate-in fade-in duration-500">
      {isLoading && <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-sm flex items-center justify-center">Loading...</div>}

      {/* BLOCK DROPDOWNS */}
      <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-[40px] border border-white shadow-xl max-w-6xl mx-auto mt-8 relative z-[60]">
        <div className="flex flex-col md:flex-row gap-4">
          
          {/* DROPDOWN NGUỒN TỪ VỰNG */}
          <CustomDropdown 
            label="Nguồn từ vựng" 
            type="source" 
            icon={getSourceIcon()}
            options={sourceOptions} 
          />

          {/* DROPDOWN CHỌN BỘ TỪ CHI TIẾT */}
          <CustomDropdown 
            label="Chọn bộ từ vựng" 
            type="category" 
            icon={HiOutlineDatabase}
            options={filteredCollections.map(c => ({ id: c.categoryID, label: c.categoryName }))} 
          />

          {/* DROPDOWN SỐ LƯỢNG */}
          <CustomDropdown 
            label="Số câu hỏi" 
            type="limit" 
            icon={HiOutlineRefresh}
            options={limits} 
          />

        </div>
      </div>

      {/* GRID CHỌN CHẾ ĐỘ CHƠI GAME */}
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
            <h2 className="text-2xl sm:text-4xl font-black tracking-tighter leading-tight">Ôn tập Ngắt quãng (SRS)</h2>
            <p className="text-xs sm:text-gray-400 max-w-xl font-medium">Luyện tập những từ khó dựa trên dữ liệu cá nhân</p>
          </div>
          <button 
            onClick={() => {
              navigate('srs'); 
              window.is_playing = true;
            }}
            className="w-full lg:w-auto bg-white text-gray-900 px-10 py-4 sm:px-14 sm:py-5 rounded-[20px] sm:rounded-[30px] font-black text-sm sm:text-lg hover:bg-red-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-4"
          >
            ÔN TẬP <HiOutlineRefresh className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;