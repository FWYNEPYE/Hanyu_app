import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SentencePuzzle = ({ puzzleData, userId, onRefresh, triggerCoinFly, fetchUserData }) => {
  const [shuffled, setShuffled] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Mỗi khi puzzleData từ cha truyền xuống thay đổi, reset lại trạng thái
  useEffect(() => {
    if (puzzleData) {
      const words = [...puzzleData.correctSentence];
      const shuffledWords = words.sort(() => Math.random() - 0.5);
      
      setShuffled(shuffledWords);
      setSelected([]);
      setIsFinished(false);
      setError("");
    }
  }, [puzzleData]);

  const handleWordClick = (word, index) => {
    setError("");
    setSelected([...selected, word]);
    setShuffled(shuffled.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (word, index) => {
    setSelected(selected.filter((_, i) => i !== index));
    setShuffled([...shuffled, word]);
  };

  const checkResult = async () => {
    if (selected.join("") === puzzleData.correctSentence.join("")) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5252/api/social/complete-puzzle', 
          { 
            puzzleId: puzzleData.id, 
            points: puzzleData.points 
          }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // 1. Kích hoạt hiệu ứng bay xu ☀️ ngay lập tức
        if (triggerCoinFly) triggerCoinFly();

        setIsFinished(true);
        setError("");

        // 2. Cập nhật Leaderboard & Activity ngay tại trang hiện tại
        if (onRefresh) onRefresh(); 

        // 3. Đợi xu bay gần tới Header (khoảng 1.2s) thì mới nhảy số điểm tổng
        setTimeout(() => {
          if (fetchUserData) fetchUserData();
        }, 1200);

      } catch (err) {
        setError("Có lỗi khi lưu kết quả. Thử lại nhé!");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Sai rồi! Hãy thử lại thứ tự khác nhé ❌");
      setTimeout(() => {
        const words = [...puzzleData.correctSentence];
        setShuffled(words.sort(() => Math.random() - 0.5));
        setSelected([]);
        setError("");
      }, 1000);
    }
  };

  if (!puzzleData && !isFinished) {
    return (
      <div className="bg-orange-50 p-6 rounded-[30px] border-2 border-orange-100 text-center">
        <p className="text-orange-400 font-bold text-sm italic">Hết ồi, mai quay lại nhé! ✨</p>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="bg-orange-50 p-8 rounded-[30px] border-2 border-orange-200 text-center animate-in zoom-in duration-300 shadow-inner">
        <div className="text-4xl mb-2">🎉</div>
        <p className="font-black text-orange-600 uppercase">Chính xác!</p>
        <p className="text-[11px] text-orange-400 mt-2 font-bold ">Bạn đã được +{puzzleData?.pointsReward || puzzleData?.points || 10} ☀️</p>
       
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-[30px] border-2 border-orange-100 shadow-sm border-b-4 border-b-orange-500 font-sans">
      <h3 className="font-black text-gray-700 mb-4 flex items-center gap-2 text-sm uppercase tracking-tight">
        <span className="text-orange-500 text-lg">🧩</span> Thử thách câu đố
      </h3>
      
      <div className={`flex flex-wrap gap-2 min-h-[80px] p-4 border-2 border-dashed border-orange-100 rounded-2xl mb-2 bg-orange-50/30 items-center justify-center transition-all ${error ? 'border-red-400 bg-red-50' : ''}`}>
        {selected.map((w, i) => (
          <button 
            key={i} 
            onClick={() => handleRemoveWord(w, i)}
            className="flex flex-col items-center hover:scale-105 transition-transform"
          >
             <span className="text-[10px] text-orange-400 font-bold">
               {puzzleData.pinyin[puzzleData.correctSentence.indexOf(w)]}
             </span>
             <span className="px-4 py-2 bg-white border-2 border-orange-300 rounded-xl font-black text-orange-600 shadow-sm text-xl">{w}</span>
          </button>
        ))}
      </div>

      <div className="h-6 mb-4 text-center">
        {error && <p className="text-red-500 text-[11px] font-bold animate-pulse">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {shuffled.map((w, i) => (
          <button 
            key={i} 
            onClick={() => handleWordClick(w, i)}
            className="px-5 py-3 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-all shadow-[0_4px_0_#e5e7eb] active:translate-y-1 active:shadow-none text-xl"
          >
            {w}
          </button>
        ))}
      </div>

      <button 
        onClick={checkResult}
        disabled={selected.length === 0 || loading}
        className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
          selected.length > 0 && !loading
          ? 'bg-orange-500 text-white shadow-[0_4px_0_#c2410c] active:translate-y-1 active:shadow-none' 
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {loading ? "Đang kiểm tra..." : "Kiểm tra kết quả"}
      </button>
    </div>
  );
};

export default SentencePuzzle;