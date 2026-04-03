import React, { useState, useEffect } from 'react';
import { HiX, HiOutlineVolumeUp, HiCheckCircle } from "react-icons/hi";

// Nhận filters và onBack (là cái callback setSelectedGame(null) từ Game.jsx)
const SRSGame = ({ filters, onBack }) => { 
  const [data, setData] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CHỖ NÀY: Sau này có Backend sẽ fetch data ở đây
    // Hiện tại để mảng rỗng 
    const fetchData = async () => {
      try {
        // Giả sử sau này: const res = await fetch('/api/srs'); const json = await res.json();
        // setData(json);
        setData([]); // Tạm thời để rỗng
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. Nếu đang tải
  if (loading) {
    return (
      <div className="fixed inset-0 z-[110] bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 2. Nếu không có dữ liệu 
  if (!data || data.length === 0) {
    return (
      <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <HiX size={40} className="text-gray-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">CHƯA CÓ TỪ CẦN ÔN</h2>
        <p className="text-gray-500 max-w-xs mb-8 font-medium">
          Chưa kết nối được</p>
        <button 
          onClick={onBack} // Gọi hàm thoát từ Game.jsx truyền xuống
          className="px-10 py-4 bg-gray-900 text-white rounded-[20px] font-black shadow-xl active:scale-95 transition-all"
        >
          QUAY LẠI SẢNH
        </button>
      </div>
    );
  }

  // 3. Nếu có dữ liệu thì chạy
  const currentWord = data[currentIndex];

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center">
       <h1 className="text-5xl font-black">{currentWord?.word}</h1>
       {/* Code giao diện game... */}
    </div>
  );
};

export default SRSGame;