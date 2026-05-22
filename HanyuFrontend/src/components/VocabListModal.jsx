import React, { useState, useEffect } from 'react';
import { HiOutlineX, HiOutlineVolumeUp, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi';
import HanziStroke from './HanziStroke'; // Đảm bảo đúng đường dẫn chung thư mục ./

const VocabListModal = ({ 
  selectedSet, 
  onClose, 
  filteredVocab, 
  setEditingWord, 
  speakHanzi, 
  handleDeleteWord,
  onUpdateCategoryName // Tích hợp lại hàm cập nhật từ component cha
}) => {
  // --- STATE QUẢN LÝ MODAL TẬP VIẾT CHỮ ---
  const [strokeModalOpen, setStrokeModalOpen] = useState(false);
  const [strokeText, setStrokeText] = useState('');

  // --- STATE QUẢN LÝ SỬA TÊN BỘ TỪ ---
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(selectedSet?.categoryName || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Đồng bộ lại tên bộ từ mỗi khi bộ từ được chọn thay đổi
  useEffect(() => {
    if (selectedSet) {
      setEditedName(selectedSet.categoryName);
      setIsEditingName(false);
    }
  }, [selectedSet]);

  // Hàm mở modal viết chữ và chặn click lan ra ngoài dòng tr / card để tránh đè lên Edit Modal
  const openStrokeModal = (e, text) => {
    e.stopPropagation(); 
    if (!text) return;
    setStrokeText(text);
    setStrokeModalOpen(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return alert("Tên bộ từ không được để trống!");
    if (editedName.trim() === selectedSet.categoryName) {
      setIsEditingName(false);
      return;
    }

    try {
      setIsSavingName(true);
      if (onUpdateCategoryName) {
        await onUpdateCategoryName(selectedSet.categoryID, editedName.trim());
      }
      setIsEditingName(false);
    } catch (err) {
      console.error("Lỗi cập nhật tên bộ từ tại Modal:", err);
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
        <div className="bg-white w-full max-w-7xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-[45px] shadow-2xl overflow-hidden flex flex-col relative">
          
          {/* HEADER MODAL CHÍNH */}
          <div className="p-3 sm:p-6  sm:pb-4  border-b border-gray-50 flex items-center justify-between shrink-0">
            
           
            <div className="flex-1 mr-4 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    disabled={isSavingName}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none font-black text-gray-800 text-base sm:text-xl focus:border-blue-500 transition-all"
                    placeholder="Nhập tên bộ từ mới..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="p-2 bg-green-50 text-green-600 border border-green-100 rounded-xl hover:bg-green-600 hover:text-white transition-all shrink-0 shadow-sm"
                    title="Xác nhận đổi tên"
                  >
                    <HiOutlineCheck size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditingName(false); setEditedName(selectedSet.categoryName); }}
                    disabled={isSavingName}
                    className="p-2 bg-gray-50 text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-all shrink-0"
                    title="Hủy bỏ"
                  >
                    <HiOutlineX size={20} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => {
                    // Chặn sửa nếu là bộ hệ thống hoặc bộ đi mượn (nếu bạn có logic phân loại này)
                    if (selectedSet.categoryType !== 'system' && !selectedSet.isBorrowed) {
                      setIsEditingName(true);
                    }
                  }}
                  className={`group w-fit select-none ${
                    selectedSet.categoryType !== 'system' && !selectedSet.isBorrowed 
                      ? 'cursor-pointer' 
                      : 'cursor-default'
                  }`}
                  title="Bấm trực tiếp vào đây để đổi tên bộ từ"
                >
                  <h3 className="text-lg sm:text-2xl font-black text-gray-800  tracking-tight truncate max-w-[220px] xs:max-w-[300px] sm:max-w-[700px] group-hover:text-blue-600 transition-colors duration-150">
                    {selectedSet.categoryName}
                  </h3>
                </div>
              )}
            </div>

            <button onClick={onClose} className="p-2.5 sm:p-3 bg-gray-100 rounded-xl sm:rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shrink-0">
              <HiOutlineX className="w-5 h-5 sm:w-6 sm:h-6"/>
            </button>
          </div>
          
          {/* VÙNG CHỨA NỘI DUNG TỪ VỰNG */}
          <div className="flex-1 overflow-auto p-4 sm:p-6  sm:pt-3  bg-slate-50/40 sm:bg-white">
            
            {/* 1. GIAO DIỆN TABLE (PC / MÀN HÌNH LỚN) */}
            <div className="hidden sm:block">
              <table className="w-full text-left border-separate border-spacing-y-2 table-fixed">
                <thead>
                  <tr className="text-[11px]  font-black text-gray-400 uppercase tracking-widest">
                    <th className="w-16  pt-0 pb-2 text-center"></th> 
                    <th className="w-[20%] px-4 pt-0 pb-2 py-4">Hán tự</th>
                    <th className="w-[20%] px-4 pt-0 pb-2  py-4">Pinyin</th>
                    <th className="w-[15%] px-4 pt-0 pb-2  py-4 hidden md:table-cell">Loại</th>
                    <th className="w-[30%] md:w-[25%] pt-0 pb-2  px-4 py-4">Nghĩa</th>
                    <th className="w-[20%] px-4 pt-0 pb-2  py-4 hidden lg:table-cell">Ví dụ</th>
                    <th className="w-[12%] px-4 pt-0 pb-2  py-4 hidden xl:table-cell">Ghi chú</th>
                    <th className="w-16  pt-0 pb-2 text-center py-4">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocab.map((item) => (
                    <tr 
                      key={item.vocaId || item.id} 
                      onClick={() => setEditingWord(item)}
                      className="bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <td className="px-0 py-5 rounded-l-[20px] text-center w-16">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); speakHanzi(item.hanzi); }}
                          className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-white transition-all shadow-sm mx-auto"
                        >
                          <HiOutlineVolumeUp size={20}/>
                        </button>
                      </td>

                      <td className="px-4 py-5 font-black text-lg sm:text-xl text-gray-800 whitespace-normal break-words">
                        <span 
                          onClick={(e) => openStrokeModal(e, item.hanzi)}
                          className="hover:text-blue-600 transition-colors duration-150 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 hover:after:w-full after:transition-all duration-300 cursor-pointer"
                          title="Bấm để xem hướng dẫn viết chữ"
                        >
                          {item.hanzi}
                        </span>
                      </td>

                      <td className="px-4 py-5 font-bold text-red-500 text-xs sm:text-sm whitespace-normal break-words">
                        [{item.pinyin}]
                      </td>

                      <td className="px-4 py-5 hidden md:table-cell">
                        <span className="inline-block px-2 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-amber-700 tracking-wider shadow-sm">
                          {item.type}
                        </span>
                      </td>

                      <td className="px-4 py-5 font-bold text-gray-700 text-sm sm:text-base break-words">
                        {item.meaning}
                      </td>

                      <td className="px-4 py-5 hidden lg:table-cell text-xs font-medium text-gray-500 whitespace-normal break-words" title={item.example}>
                        {item.example}
                      </td>

                      <td className="px-4 py-5 hidden xl:table-cell text-xs font-medium text-gray-400 whitespace-normal break-words">
                        {item.note}
                      </td>

                      <td className="px-4 py-5 rounded-r-[20px] text-center w-16">
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteWord(e, item.vocaId || item.id); }} 
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

            {/* 2. GIAO DIỆN CARDS DỌC (MOBILE) */}
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
                    
                    <div className="flex flex-col min-w-0 flex-1"> 
                      <span 
                        onClick={(e) => openStrokeModal(e, item.hanzi)}
                        className="text-xl font-black text-gray-800 hover:text-blue-600 break-words whitespace-normal leading-tight"
                        title="Bấm để xem hướng dẫn viết chữ"
                      >
                        {item.hanzi}
                      </span>
                      
                      <span className="font-bold text-red-500 text-[11px] leading-tight mt-0.5 inline-block">
                        [{item.pinyin}]
                      </span>
                    </div>
                  </div>

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
            
            {filteredVocab.length === 0 && (
              <p className="text-center py-10 font-bold text-gray-300">Bộ từ này đang trống...</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. SUB-MODAL TẬP VIẾT CHỮ */}
      {strokeModalOpen && (
        <div 
          className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setStrokeModalOpen(false)} 
        >
          <div 
            className="bg-white w-full max-w-[310px] rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col p-6 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              type="button" 
              onClick={() => setStrokeModalOpen(false)} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all focus:outline-none z-[260]"
            >
              <HiOutlineX size={14} />
            </button>

            <div className="w-full flex flex-col items-center justify-center pt-3">
              <HanziStroke text={strokeText} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VocabListModal;