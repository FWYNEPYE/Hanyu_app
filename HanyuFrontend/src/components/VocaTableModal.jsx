import React from 'react';
import { 
  HiOutlineX, HiOutlineVolumeUp, HiOutlineTrash, HiOutlineSave, 
  HiOutlinePencilAlt, HiOutlineFolderAdd, HiOutlineGlobeAlt 
} from "react-icons/hi";

const VocaTableModal = ({ 
  selectedSet, setSelectedSet,
  editingWord, setEditingWord,
  isAddModalOpen, setIsAddModalOpen,
  isCreateSetModalOpen, setIsCreateSetModalOpen,
  isPublicModalOpen, setIsPublicModalOpen,
  filteredVocab, collections, userData, vocabData,
  rows, setRows, loading,
  newCategoryName, setNewCategoryName,
  selectedCategoryId, setSelectedCategoryId,
  targetCategory,
  publicPrice, setPublicPrice, publicIcon, setPublicIcon,
  publicColor, setPublicColor, publicTag, setPublicTag,
  publicDesc, setPublicDesc,
  onSpeak, onDeleteWord, onUpdateWord, onSaveAllRows, onCreateCategory, onTogglePublic, detectHSKLevel
}) => {

  return (
    <>
      {/* --- 1. MODAL DANH SÁCH TỪ --- */}
      {selectedSet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-6xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-[45px] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
              <h3 className="text-xl sm:text-2xl font-black text-gray-800 uppercase italic">Bộ: {selectedSet.categoryName}</h3>
              <button onClick={() => setSelectedSet(null)} className="p-3 bg-gray-100 rounded-2xl hover:bg-red-50 transition-all"><HiOutlineX size={24}/></button>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-8">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="w-16"></th>
                    <th className="px-4 py-4">Hán tự</th>
                    <th className="px-4 py-4">Pinyin</th>
                    <th className="px-4 py-4">Nghĩa</th>
                    <th className="px-4 py-4 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocab.map((item) => (
                    <tr key={item.vocaId || item.id} onClick={() => setEditingWord(item)} className="bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                      <td className="px-4 py-5 rounded-l-[20px] text-center">
                        <button onClick={(e) => { e.stopPropagation(); onSpeak(item.hanzi); }} className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-red-500 shadow-sm"><HiOutlineVolumeUp size={20}/></button>
                      </td>
                      <td className="px-4 py-5 font-black text-xl sm:text-2xl text-gray-800">{item.hanzi}</td>
                      <td className="px-4 py-5 font-bold text-red-500 italic text-sm">[{item.pinyin}]</td>
                      <td className="px-4 py-5 font-bold text-gray-700">{item.meaning}</td>
                      <td className="px-4 py-5 rounded-r-[20px] text-center">
                        <button onClick={(e) => onDeleteWord(e, item.vocaId || item.id)} className="p-3 text-gray-300 hover:text-red-500 transition-all"><HiOutlineTrash size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. MODAL EDIT TỪ --- */}
      {editingWord && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-6 sm:p-10 border border-white relative">
            <h4 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3 italic uppercase"><HiOutlinePencilAlt className="text-red-600" size={24}/> Chỉnh sửa</h4>
            <div className="space-y-5">
               <input type="text" value={editingWord.hanzi} onChange={(e) => setEditingWord({...editingWord, hanzi: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-2xl outline-none" placeholder="Hán tự" />
               <input type="text" value={editingWord.pinyin} onChange={(e) => setEditingWord({...editingWord, pinyin: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-red-500 outline-none" placeholder="Pinyin" />
               <input type="text" value={editingWord.meaning} onChange={(e) => setEditingWord({...editingWord, meaning: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold outline-none" placeholder="Nghĩa" />
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setEditingWord(null)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase">Hủy</button>
              <button onClick={onUpdateWord} className="flex-1 py-4 bg-red-600 text-white rounded-[20px] font-black text-xs shadow-lg uppercase">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* --- 3. MODAL THÊM TỪ MỚI --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-7xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-[45px] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 flex items-center justify-between shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h3 className="text-xl font-black text-gray-800 uppercase italic">Thêm từ mới</h3>
                <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-xs outline-none">
                  {collections.map(c => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
                </select>
                <button onClick={() => setIsCreateSetModalOpen(true)} className="text-sm font-bold text-red-500 underline underline-offset-4"><HiOutlineFolderAdd size={20}/></button>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-gray-100 rounded-2xl transition-all"><HiOutlineX size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto px-6 sm:px-10 py-6">
              <table className="w-full border-separate border-spacing-y-2 min-w-[800px]">
                <thead>
                  <tr className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="pb-4 px-2">Hán tự *</th>
                    <th className="pb-4 px-2">Pinyin</th>
                    <th className="pb-4 px-2">Nghĩa *</th>
                    <th className="pb-4 px-2 text-center w-16">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="p-1"><input type="text" className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold focus:border-red-500 transition-all" value={row.hanzi} onChange={(e) => { const newRows = [...rows]; newRows[index].hanzi = e.target.value; setRows(newRows); }} /></td>
                      <td className="p-1"><input type="text" className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold text-red-500 transition-all" value={row.pinyin} onChange={(e) => { const newRows = [...rows]; newRows[index].pinyin = e.target.value; setRows(newRows); }} /></td>
                      <td className="p-1"><input type="text" className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold transition-all" value={row.meaning} onChange={(e) => { const newRows = [...rows]; newRows[index].meaning = e.target.value; setRows(newRows); }} /></td>
                      <td className="p-1 text-center"><button onClick={() => setRows(rows.filter(r => r.id !== row.id))} className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><HiOutlineTrash size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setRows([...rows, { id: Date.now(), hanzi: '', pinyin: '', meaning: '', type: 'Danh từ' }])} className="w-full mt-6 py-5 border-2 border-dashed border-gray-200 rounded-[30px] text-gray-400 font-black text-xs hover:text-red-500 transition-all uppercase">+ Thêm dòng mới</button>
            </div>
            <div className="px-10 py-8 border-t border-gray-50 flex justify-end items-center bg-white shrink-0">
               <button onClick={onSaveAllRows} disabled={loading} className={`w-full sm:w-auto px-16 py-5 ${loading ? 'bg-gray-400' : 'bg-[#00D060]'} text-white rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all uppercase`}>
                 <HiOutlineSave size={22} /> {loading ? 'Đang lưu...' : 'Lưu bộ từ'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 4. MODAL TẠO BỘ TỪ MỚI --- */}
      {isCreateSetModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10">
            <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 uppercase italic"><HiOutlineFolderAdd size={28} className="text-red-600" /> Tạo bộ từ mới</h4>
            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Tên bộ từ..." className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:border-red-500 transition-all" />
            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsCreateSetModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase">Hủy</button>
              <button onClick={onCreateCategory} className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black text-xs shadow-lg uppercase transition-all active:scale-95">Tạo bộ</button>
            </div>
          </div>
        </div>
      )}

      {/* --- 5. MODAL CÔNG KHAI (UI SANG TRỌNG HƠN) --- */}
      {isPublicModalOpen && targetCategory && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
          <div className="bg-white w-full max-w-lg rounded-[50px] p-8 shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-6 px-2">
              <div className="flex items-center gap-3">
                <img src={userData?.avatar || `https://ui-avatars.com/api/?name=${userData?.name || 'U'}&background=FB923C&color=fff`} className="w-10 h-10 rounded-full border-2 border-orange-100 object-cover" alt="avatar" />
                <span className="text-sm font-black text-gray-800 uppercase tracking-tight">{userData?.name || "User"}</span>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-[40px] p-6 shadow-xl mb-6">
              <div className={`w-full h-48 ${publicColor} rounded-[30px] mb-6 flex items-center justify-center relative`}>
                 <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                    <span className="text-red-500 text-xs">☀️</span>
                    <input type="number" value={publicPrice} onChange={(e) => setPublicPrice(e.target.value)} className="w-10 bg-transparent text-xs font-black text-red-500 outline-none p-0" />
                 </div>
                 <div className="text-6xl">{publicIcon}</div>
              </div>
              <h5 className="text-2xl font-black text-gray-800 tracking-tighter mb-1 leading-tight">{targetCategory?.categoryName}</h5>
              <textarea className="w-full bg-transparent p-0 text-sm font-bold text-gray-400 outline-none resize-none border-none focus:ring-0" value={publicDesc} onChange={(e) => setPublicDesc(e.target.value)} placeholder="Nhập mô tả bộ từ..." rows={2}/>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsPublicModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black text-[11px] uppercase tracking-widest">Đóng</button>
              <button onClick={onTogglePublic} className="flex-[2] py-4 rounded-[22px] font-black text-[11px] uppercase transition-all bg-[#00C25B] text-white shadow-xl active:scale-95">
                {targetCategory.isPublic ? "Cập nhật bài đăng" : "Đăng ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VocaTableModal;