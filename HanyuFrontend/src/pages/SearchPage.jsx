import React, { useState } from 'react';
import { 
  HiOutlineSearch, HiOutlineVolumeUp, HiOutlineSparkles, 
  HiOutlineBookOpen, HiOutlineMicrophone, HiOutlinePencilAlt, HiX 
} from "react-icons/hi";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const mockResult = {
    word: "学习",
    pinyin: "xuéxí",
    meaning: "Học tập, nghiên cứu",
    definition: "Hoạt động thu nhận kiến thức thông qua đọc, luyện tập.",
    strokeImage: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndXp4amV4bXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6eXJ6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxofQH1Z9ba/giphy.gif", // Link demo
    grammar: "Là động từ, có thể đi kèm tân ngữ. Ví dụ: 学习汉语.",
    examples: [
      { zh: "他非常努力地学习汉语。", vi: "Anh ấy học tiếng Trung rất chăm chỉ." },
    ]
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10 space-y-8 animate-in fade-in duration-500">
      
      {/* --- 1. SEARCH BAR --- */}
      <div className="text-center space-y-4 pt-6">
        {/* <h2 className="text-3xl font-black text-[#2d3436]">Tra từ điển <span className="text-red-600">AI</span></h2> */}
        
        <form className="relative max-w-3xl mx-auto mt-8 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500">
            <HiOutlineSearch size={24} />
          </div>
          
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nhập Hán tự, Pinyin..."
            className="w-full p-5 pl-14 pr-32 rounded-full border-2 border-white bg-white shadow-xl focus:border-red-500 outline-none transition-all text-base md:text-lg"
          />

          {/* Các icon chức năng bổ sung */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-l pl-3 border-gray-100">
            <button type="button" className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <HiOutlineMicrophone size={22} />
            </button>
            <button type="button" className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
              <HiOutlinePencilAlt size={22} />
            </button>
          </div>
        </form>
      </div>

      
      {/* --- 2. LAYOUT KẾT QUẢ --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
        
        {/* BÊN TRÁI (4/12): Từ vựng chính */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white p-6 md:p-8 rounded-[35px] border border-gray-100 shadow-sm text-center">
            
            <div className="text-6xl font-black text-[#2d3436] mb-2 tracking-tight">{mockResult.word}</div>
            <div className="text-lg font-bold text-gray-400 mb-5">[{mockResult.pinyin}]</div>
            
            <button className="w-full py-3.5 bg-red-50 text-red-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-100 transition-all text-sm">
              <HiOutlineVolumeUp size={20} /> Phát âm
            </button>
          </div>

          {/* BOX THỨ TỰ NÉT VẼ*/}
          <div className="bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm">
            <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 mb-4 flex items-center gap-2">
              <HiOutlinePencilAlt className="text-blue-500" size={18} /> Thứ tự nét vẽ
            </h4>
            <div className="aspect-square max-w-[180px] mx-auto bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-dashed border-gray-200">
              <img src="https://www.hanzi5.com/assets/bihua/gif/5b66.gif" alt="Stroke order" className="w-3/4 h-3/4 object-contain opacity-80" />
            </div>
          </div>
        </div>

        {/* Giải nghĩa & Ngữ pháp */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <HiOutlineSparkles size={22} />
              <span className="font-black uppercase tracking-widest text-[10px]">AI Phân tích chi tiết</span>
            </div>



            {/* Tăng size nghĩa tiếng Việt */}
            <h3 className="text-2xl font-black mb-3 text-[#2d3436]">{mockResult.meaning}</h3>
            <p className="text-gray-500 leading-relaxed text-base font-medium mb-6">"{mockResult.definition}"</p>
            
            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <h4 className="font-black text-blue-700 text-[11px] uppercase mb-2 tracking-wider">Điểm ngữ pháp:</h4>
              <p className="text-blue-800/70 text-sm font-medium leading-relaxed">
                {mockResult.grammar}
              </p>
            </div>
          </div>

          {/* Box Ví dụ */}
          <div className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 text-green-500 mb-5">
              <HiOutlineBookOpen size={22} />
              <span className="font-black uppercase tracking-widest text-[10px]">Ví dụ minh họa</span>
            </div>
            <div className="space-y-4">
              {mockResult.examples.map((ex, i) => (
                <div key={i} className="p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                  <p className="text-lg font-bold text-[#2d3436]">{ex.zh}</p>
                  <p className="text-gray-400 text-sm font-medium mt-1">{ex.vi}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SearchPage;