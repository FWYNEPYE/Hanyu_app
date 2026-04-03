import React, { useState } from 'react';

const SentencePuzzle = () => {
  const correctSentence = ["我", "在", "学", "汉语"]; 
  const pinyin = ["Wǒ", "zài", "xué", "Hànyǔ"];
  const initialShuffled = ["学", "汉语", "我", "在"];
  
  const [shuffled, setShuffled] = useState(initialShuffled);
  const [selected, setSelected] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(""); // Lưu thông báo lỗi

  const handleWordClick = (word, index) => {
    setError(""); // Xóa lỗi ngay khi người dùng bắt đầu chọn lại
    setSelected([...selected, word]);
    setShuffled(shuffled.filter((_, i) => i !== index));
  };

  const checkResult = () => {
    if (selected.join("") === correctSentence.join("")) {
      setIsFinished(true);
      setError("");
    } else {
    //thông báo lỗi
      setError("Sai rồi! Hãy thử lại thứ tự khác nhé ❌");
      
      // Sau 2 giây thì tự xóa thông báo lỗi (optional)
      setTimeout(() => {
        setShuffled(initialShuffled);
        setSelected([]);
      }, 500);
    }
  };

  if (isFinished) {
    return (
      <div className="bg-orange-50 p-8 rounded-[30px] border-2 border-orange-200 text-center animate-in zoom-in duration-300">
        <div className="text-4xl mb-2">🎉</div>
        <p className="font-black text-orange-600">Xong ồiiii</p>
        <p className="text-xs text-orange-400 mt-2 font-bold italic">Đợi chúng mình cập nhật câu đố mới nha</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-[30px] border-2 border-orange-100 shadow-sm border-b-4 border-b-orange-500 font-sans">
      <h3 className="font-black text-gray-700 mb-4 flex items-center gap-2 text-sm">
        <span className="text-orange-500 text-lg">🧩</span> Giải ô chữ
      </h3>
      
      {/* Vùng chứa các chữ đã chọn */}
      <div className={`flex flex-wrap gap-2 min-h-[60px] p-4 border-2 border-dashed border-orange-100 rounded-2xl mb-2 bg-orange-50/30 items-center justify-center transition-all ${error ? 'border-red-400 bg-red-50 animate-bounce' : ''}`}>
        {selected.map((w, i) => (
          <div key={i} className="flex flex-col items-center">
             <span className="text-[10px] text-orange-400 font-bold">{pinyin[correctSentence.indexOf(w)]}</span>
             <span className="px-4 py-2 bg-white border-2 border-orange-300 rounded-xl font-black text-orange-600 shadow-sm text-xl">{w}</span>
          </div>
        ))}
      </div>

      {/* Thông báo lỗi hiển thị ngay*/}
      <div className="h-6 mb-4 text-center">
        {error && <p className="text-red-500 text-[11px] font-bold animate-pulse">{error}</p>}
      </div>

      {/* Vùng chứa các chữ gợi ý */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {shuffled.map((w, i) => (
          <button 
            key={i} 
            onClick={() => handleWordClick(w, i)}
            className="px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl font-black text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-all shadow-[0_4px_0_#e5e7eb] active:translate-y-1 active:shadow-none text-xl"
          >
            {w}
          </button>
        ))}
      </div>

      <button 
        onClick={checkResult}
        disabled={selected.length === 0}
        className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
          selected.length > 0 
          ? 'bg-orange-500 text-white shadow-[0_4px_0_#c2410c] active:translate-y-1 active:shadow-none' 
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Kiểm tra
      </button>
    </div>
  );
};

export default SentencePuzzle;