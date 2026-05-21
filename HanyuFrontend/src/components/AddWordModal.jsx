import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineFolderAdd, HiOutlineX, HiOutlineTrash, HiOutlineSave, HiChevronDown } from 'react-icons/hi';

const AddWordModal = ({
  isOpen,
  onClose,
  collections = [], 
  selectedCategoryId,
  setSelectedCategoryId,
  rows,
  setRows,
  loading,
  onSave,
  onOpenCreateSet
}) => {
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const selectedCategory = collections.find(c => String(c.categoryID) === String(selectedCategoryId));

  // Hàm cập nhật nhanh giá trị input cho cả Table và Card Mobile
  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md">
      {/* h-full trên mobile để chiếm trọn màn hình, sm:h-auto trên PC */}
      <div className="bg-white w-full max-w-7xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-[45px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        
        {/* --- HEADER (Đã responsive thu gọn trên mobile) --- */}
        <div className="px-4 sm:px-10 py-5 sm:py-8 border-b border-gray-50 flex items-center justify-between shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1 mr-2">
            <h3 className="text-lg sm:text-xl font-black text-gray-800 uppercase tracking-tight">Thêm từ mới</h3>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Custom Dropdown */}
              <div className="relative w-40 sm:w-56" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 font-black text-[11px] sm:text-xs text-gray-700 flex items-center justify-between shadow-sm hover:bg-slate-100 transition-all focus:outline-none"
                >
                  <span className="truncate">
                    {selectedCategory ? selectedCategory.categoryName : 'Chọn bộ từ...'}
                  </span>
                  <HiChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 ${isOpenDropdown ? 'rotate-180' : ''}`} />
                </button>

                {isOpenDropdown && (
                  <div className="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-[200] py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                    {collections && collections.length > 0 ? (
                      collections.map((c) => (
                        <button
                          key={c.categoryID}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(c.categoryID);
                            setIsOpenDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 font-bold text-xs transition-all flex items-center justify-between focus:outline-none
                            ${String(c.categoryID) === String(selectedCategoryId) ? 'bg-red-50 text-red-600 font-black' : 'text-gray-600 hover:bg-slate-50'}`}
                        >
                          <span className="truncate">{c.categoryName}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs font-bold text-gray-400 text-center">Chưa có bộ từ...</div>
                    )}
                  </div>
                )}
              </div>

              {/* Nút thêm nhanh bộ từ */}
              <button 
                type="button" 
                onClick={onOpenCreateSet} 
                className="w-9 h-9 sm:w-10 sm:h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm shrink-0"
              >
                <HiOutlineFolderAdd size={18}/>
              </button>
            </div>
          </div>

          <button type="button" onClick={onClose} className="p-2 sm:p-3 bg-gray-100 rounded-xl sm:rounded-2xl hover:bg-gray-200 transition-all shrink-0">
            <HiOutlineX className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* --- BODY KHU VỰC NHẬP LIỆU --- */}
        <div className="flex-1 overflow-auto px-4 sm:px-10 py-4 sm:py-6 bg-slate-50/50 sm:bg-white">
          
          {/* 1. GIAO DIỆN TABLE (Chỉ hiển thị từ màn hình PC/Tablet trở lên: sm) */}
          <div className="hidden sm:block">
            <table className="w-full border-separate border-spacing-y-2 min-w-[900px]">
              <thead>
                <tr className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="pb-4 px-2">Hán tự *</th>
                  <th className="pb-4 px-2">Pinyin</th>
                  <th className="pb-4 px-2">Nghĩa *</th>
                  <th className="pb-4 px-2">Loại</th>
                  <th className="pb-4 px-2">Ví dụ</th>
                  <th className="pb-4 px-2">Ghi chú</th>
                  <th className="pb-4 px-2 text-center w-16">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="p-1"><input type="text" className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold focus:border-red-500" value={row.hanzi} onChange={(e) => handleInputChange(index, 'hanzi', e.target.value)} placeholder="学习" /></td>
                    <td className="p-1"><input type="text" className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold text-red-500" value={row.pinyin} onChange={(e) => handleInputChange(index, 'pinyin', e.target.value)} placeholder="xuéxí" /></td>
                    <td className="p-1"><input type="text" className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold" value={row.meaning} onChange={(e) => handleInputChange(index, 'meaning', e.target.value)} placeholder="Học tập" /></td>
                    <td className="p-1"><input type="text" className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold" value={row.type} onChange={(e) => handleInputChange(index, 'type', e.target.value)} placeholder='Động từ...' /></td>
                    <td className="p-1"><input type="text" className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none text-xs" value={row.example} onChange={(e) => handleInputChange(index, 'example', e.target.value)} placeholder="Ví dụ..." /></td>
                    <td className="p-1"><input type="text" className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none text-xs" value={row.note} onChange={(e) => handleInputChange(index, 'note', e.target.value)} placeholder="Ghi chú..." /></td>
                    <td className="p-1 text-center">
                      <button type="button" onClick={() => setRows(rows.filter(r => r.id !== row.id))} className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><HiOutlineTrash size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. GIAO DIỆN CARDS XẾP DỌC (Chỉ hiển thị trên MOBILE: dưới mức sm) */}
          <div className="block sm:hidden space-y-4">
            {rows.map((row, index) => (
              <div key={row.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative space-y-3">
                {/* Số thứ tự từ và nút xóa góc phải */}
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Từ vựng #{index + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => setRows(rows.filter(r => r.id !== row.id))}
                    className="p-2 bg-red-50 text-red-500 rounded-lg active:bg-red-500 active:text-white transition-all"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>

                {/* Các ô input xếp gọn thành lưới 2 cột cho mobile dễ nhìn */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Hán tự *</label>
                    <input type="text" className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:bg-white focus:border-red-500" value={row.hanzi} onChange={(e) => handleInputChange(index, 'hanzi', e.target.value)} placeholder="学习" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Pinyin</label>
                    <input type="text" className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm text-red-500 focus:bg-white" value={row.pinyin} onChange={(e) => handleInputChange(index, 'pinyin', e.target.value)} placeholder="xuéxí" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Loại từ</label>
                    <input type="text" className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold focus:bg-white" value={row.type} onChange={(e) => handleInputChange(index, 'type', e.target.value)} placeholder="Động từ..." />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nghĩa *</label>
                    <input type="text" className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm focus:bg-white" value={row.meaning} onChange={(e) => handleInputChange(index, 'meaning', e.target.value)} placeholder="Học tập" />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Ví dụ </label>
                    <textarea rows={2} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs focus:bg-white resize-none" value={row.example} onChange={(e) => handleInputChange(index, 'example', e.target.value)} placeholder="我学习汉语。" />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Ghi chú</label>
                    <input type="text" className="w-full px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs focus:bg-white" value={row.note} onChange={(e) => handleInputChange(index, 'note', e.target.value)} placeholder="Ghi chú thêm..." />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Nút Thêm Dòng chung */}
          <button 
            type="button"
            onClick={() => setRows([...rows, { id: Date.now(), hanzi: '', pinyin: '', meaning: '', type: '', example: '', note: '' }])} 
            className="w-full mt-4 sm:mt-6 py-4 sm:py-5 border-2 border-dashed border-gray-200 rounded-[20px] sm:rounded-[30px] text-gray-400 font-black text-xs hover:text-red-500 transition-all flex items-center justify-center gap-3 bg-white"
          >
            + THÊM TỪ MỚI
          </button>
        </div>

        {/* --- FOOTER ACTIONS (Tràn viền mượt trên mobile) --- */}
        <div className="px-4 sm:px-10 py-4 sm:py-8 border-t border-gray-50 flex justify-end items-center bg-white shrink-0">
           <button 
            type="button"
            onClick={onSave}
            disabled={loading}
            className="w-full sm:w-auto px-16 py-4 sm:py-5 bg-[#00D060] disabled:bg-gray-400 hover:bg-[#00B855] text-white rounded-xl sm:rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
           >
             <HiOutlineSave size={22} /> {loading ? 'ĐANG LƯU...' : 'LƯU'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AddWordModal;