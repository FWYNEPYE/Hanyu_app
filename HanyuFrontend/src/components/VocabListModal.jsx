import React, { useState } from 'react';
import { HiOutlineX, HiOutlineVolumeUp, HiOutlineTrash } from 'react-icons/hi';
import HanziStroke from './HanziStroke'; // Đảm bảo đúng đường dẫn chung thư mục ./

const VocabListModal = ({ selectedSet, onClose, filteredVocab, setEditingWord, speakHanzi, handleDeleteWord }) => {
  // --- STATE QUẢN LÝ MODAL TẬP VIẾT CHỮ ---
  const [strokeModalOpen, setStrokeModalOpen] = useState(false);
  const [strokeText, setStrokeText] = useState('');

  // Hàm mở modal viết chữ và chặn click lan ra ngoài dòng tr / card để tránh đè lên Edit Modal
  const openStrokeModal = (e, text) => {
    e.stopPropagation(); 
    if (!text) return;
    setStrokeText(text);
    setStrokeModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
        <div className="bg-white w-full max-w-6xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-[45px] shadow-2xl overflow-hidden flex flex-col relative">
          
          {/* HEADER MODAL CHÍNH */}
          <div className="p-5 sm:p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
            <h3 className="text-lg sm:text-2xl font-black text-gray-800 uppercase tracking-tight truncate mr-2">
              Bộ: {selectedSet.categoryName}
            </h3>
            <button onClick={onClose} className="p-2.5 sm:p-3 bg-gray-100 rounded-xl sm:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shrink-0">
              <HiOutlineX className="w-5 h-5 sm:w-6 sm:h-6"/>
            </button>
          </div>
          
          {/* VÙNG CHỨA NỘI DUNG TỪ VỰNG */}
          <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50/40 sm:bg-white">
            
            {/* ----------------------------------------------------
                1. GIAO DIỆN TABLE (HIỂN THỊ TRÊN PC / MÀN HÌNH LỚN)
               ---------------------------------------------------- */}
            <div className="hidden sm:block">
              <table className="w-full text-left border-separate border-spacing-y-2 table-fixed">
                <thead>
                  <tr className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="w-16 text-center"></th> 
                    <th className="w-[20%] px-4 py-4">Hán tự</th>
                    <th className="w-[20%] px-4 py-4">Pinyin</th>
                    <th className="w-[15%] px-4 py-4 hidden md:table-cell">Loại</th>
                    <th className="w-[30%] md:w-[25%] px-4 py-4">Nghĩa</th>
                    <th className="w-[20%] px-4 py-4 hidden lg:table-cell">Ví dụ</th>
                    <th className="w-[12%] px-4 py-4 hidden xl:table-cell">Ghi chú</th>
                    <th className="w-16 text-center py-4">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocab.map((item) => (
                    <tr 
                      key={item.vocaId || item.id} 
                      onClick={() => setEditingWord(item)}
                      className="bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all cursor-pointer group"
                    >
                      {/* Cột Phát Âm */}
                      <td className="px-4 py-5 rounded-l-[20px] text-center w-16">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); speakHanzi(item.hanzi); }}
                          className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm mx-auto"
                        >
                          <HiOutlineVolumeUp size={20}/>
                        </button>
                      </td>

                      {/* Cột Hán Tự */}
                        <td className="px-4 py-5 font-black text-lg sm:text-xl text-gray-800 whitespace-normal break-words">
                        <span 
                            onClick={(e) => openStrokeModal(e, item.hanzi)}
                            className="hover:text-blue-600 transition-colors duration-150 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all duration-300 cursor-pointer"
                            title="Bấm để xem hướng dẫn viết chữ"
                        >
                            {item.hanzi}
                        </span>
                        </td>

                        {/* Cột Pinyin */}
                        <td className="px-4 py-5 font-bold text-red-500 text-xs sm:text-sm whitespace-normal break-words">
                        [{item.pinyin}]
                        </td>

                      {/* Cột Loại từ */}
                      <td className="px-4 py-5 hidden md:table-cell">
                        <span className="inline-block px-2 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-amber-700 tracking-wider shadow-sm">
                          {item.type}
                        </span>
                      </td>

                      {/* Cột Định nghĩa */}
                      <td className="px-4 py-5 font-bold text-gray-700 text-sm sm:text-base break-words">
                        {item.meaning}
                      </td>

                      {/* Cột Ví dụ */}
                      <td className="px-4 py-5 hidden lg:table-cell text-xs text-gray-500  whitespace-normal break-words" title={item.example}>
                        {item.example}
                      </td>

                      {/* Cột Ghi chú */}
                      <td className="px-4 py-5 hidden xl:table-cell text-xs text-gray-400 whitespace-normal break-words">
                        {item.note}
                      </td>

                      {/* Cột Xóa từ */}
                      {/* Cột Xóa từ - Tách riêng, màu đỏ nổi bật */}
                        <td className="px-4 py-5 rounded-r-[20px] text-center w-16">
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteWord(e, item.vocaId || item.id); }} 
                            /* Dùng 'text-red-400' để màu đỏ vừa phải, hover chuyển 'text-red-600' cực bén */
                            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 text-red-400 hover:bg-red-50 hover:text-red-600 active:scale-95"
                        >
                            <HiOutlineTrash size={20}/>
                        </button>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ----------------------------------------------------
                2. GIAO DIỆN CARDS DỌC (TỐI ƯU SIÊU ĐẸP CHO MOBILE)
               ---------------------------------------------------- */}
           {/* GIAO DIỆN CARDS DỌC (MOBILE - SỬA CỐT LÕI ĐỂ KHÔNG BỊ VỠ LAYOUT) */}
            <div className="block sm:hidden space-y-3">
            {filteredVocab.map((item) => (
                <div 
                key={item.vocaId || item.id}
                onClick={() => setEditingWord(item)}
                className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-2 relative active:scale-[0.99] transition-all cursor-pointer"
                >
                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteWord(e, item.vocaId || item.id); }} 
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all z-10 active:scale-90"
                    >
                    <HiOutlineTrash size={15}/>
                </button>

                <div className="flex items-center gap-3">
                    <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); speakHanzi(item.hanzi); }}
                    className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-red-500 shrink-0"
                    >
                    <HiOutlineVolumeUp size={16}/>
                    </button>
                    
                    {/* CỤM HÁN TỰ & PINYIN  */}
                    <div className="flex flex-col min-w-0 flex-1"> 
                        {/* Hán tự: Dùng break-words để xuống dòng nếu là từ ghép siêu dài */}
                        <span 
                            onClick={(e) => openStrokeModal(e, item.hanzi)}
                            className="text-xl font-black text-gray-800 hover:text-blue-600 break-words whitespace-normal leading-tight"
                            title="Bấm để xem hướng dẫn viết chữ"
                        >
                            {item.hanzi}
                        </span>
                        
                        {/* Pinyin: Dùng inline-block để ép trình duyệt hiểu cả cụm là 1 đơn vị không tách rời */}
                        <span className="font-bold text-red-500 text-[11px] leading-tight mt-0.5 inline-block">
                        [{item.pinyin}]
                        </span>
                    </div>
                </div>

                {/* 2. Hàng nội dung chính: Nghĩa & Loại từ (Cho phép xuống dòng tự do) */}
                <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2">
                    {item.type && (
                        <span className="shrink-0 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg text-[9px] font-black text-amber-700 uppercase">
                        {item.type}
                        </span>
                    )}
                    <span className="font-bold text-gray-700 text-sm leading-snug break-words">
                        {item.meaning}
                    </span>
                    </div>
                </div>

                {/* 3. Hàng Ghi chú/Ví dụ: Dùng background mờ để tách biệt, chữ nhỏ lại */}
                {(item.example || item.note) && (
                    <div className="bg-slate-50/80 rounded-xl p-3 mt-1 space-y-1">
                    {item.example && (
                        <p className="text-gray-600 text-[11px] italic break-words leading-tight">
                        <span className="font-bold text-gray-400 mr-1">VD:</span>{item.example}
                        </p>
                    )}
                    {item.note && (
                        <p className="text-gray-400 text-[11px] break-words leading-tight">
                        <span className="font-bold text-gray-400 mr-1">Note:</span>{item.note}
                        </p>
                    )}
                    </div>
                )}
                </div>
            ))}
            </div>
            
            {/* Trạng thái danh sách trống */}
            {filteredVocab.length === 0 && (
              <p className="text-center py-10 font-bold text-gray-300">Bộ từ này đang trống...</p>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------
          3. SUB-MODAL TẬP VIẾT CHỮ (TỰ ĐỘNG ĐÈ TRÊN CÙNG Z-[250])
         ---------------------------------------------------- */}
      {strokeModalOpen && (
        <div 
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setStrokeModalOpen(false)} // Click ra ngoài là đóng luôn, siêu tiện!
        >
          <div 
            className="bg-white w-full max-w-[310px] rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col p-6 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()} // Không cho click bên trong ô bị đóng nhầm
          >
            
            {/* Nút đóng hình X tròn nhỏ tinh tế góc trên phải */}
            <button 
              type="button" 
              onClick={() => setStrokeModalOpen(false)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all focus:outline-none z-[260]"
            >
              <HiOutlineX size={14} />
            </button>

            {/* Nội dung chính: Gọi component HanziStroke để vẽ động chữ */}
            <div className="w-full flex flex-col items-center justify-center pt-3">
              <HanziStroke text={strokeText} />
            </div>

            {/* Label trang trí nhỏ tinh tế ở đáy modal */}
           
          </div>
        </div>
      )}
    </>
  );
};

export default VocabListModal;