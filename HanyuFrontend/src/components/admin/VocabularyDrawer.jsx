import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlinePlus, HiOutlineTrash, HiX, HiOutlinePencil, HiOutlineCheck, HiOutlineInformationCircle } from "react-icons/hi";

const VocabularyDrawer = ({ isOpen, onClose, categoryId, categoryName, level }) => {
  const [vocabList, setVocabList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const [newWord, setNewWord] = useState({
    hanzi: '', pinyin: '', meaning: '', type: 'N', 
    example: '', exampleMeaning: '', level: level 
  });

  const fetchVocab = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/Vocabulary/category/${categoryId}`);
      setVocabList(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen) {
      setNewWord(prev => ({ ...prev, level: level }));
      fetchVocab();
    }
  }, [isOpen, categoryId, level]);

  const handleAdd = async () => {
    if (!newWord.hanzi || !newWord.meaning) return alert("Thiếu Hán tự hoặc Nghĩa sếp ơi!");
    try {
      await axios.post(`/api/Vocabulary`, { ...newWord, categoryId });
      setNewWord({ 
        hanzi: '', pinyin: '', meaning: '', type: 'N', 
        example: '', exampleMeaning: '', level: level 
      });
      fetchVocab();
    } catch (err) { alert("Lỗi thêm từ!"); }
  };

  const startEdit = (word) => {
    setEditingId(word.vocaId);
    setEditForm(word);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/Vocabulary/${editingId}`, editForm);
      setEditingId(null);
      fetchVocab();
    } catch (err) { alert("Lỗi cập nhật!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa nhé sếp?")) return;
    await axios.delete(`/api/Vocabulary/${id}`);
    fetchVocab();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end text-slate-300 font-sans">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[95vw] lg:max-w-7xl bg-[#0D1117] h-full shadow-2xl border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header - Tinh gọn */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#161B26]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Hán Ngữ: {categoryName}</h2>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-widest">Level {level}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-all"><HiX size={24} /></button>
        </div>

        {/* Form Nhập Mới - TẤT CẢ TRÊN 1 HÀNG */}
        <div className="p-4 bg-[#161B26]/30 border-b border-slate-800">
          <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1">
              <input value={newWord.hanzi} onChange={e => setNewWord({...newWord, hanzi: e.target.value})} className="w-full bg-[#0D1117] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Hán tự" />
            </div>
            <div className="col-span-1">
              <input value={newWord.pinyin} onChange={e => setNewWord({...newWord, pinyin: e.target.value})} className="w-full bg-[#0D1117] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Pinyin" />
            </div>
            <div className="col-span-2">
              <input value={newWord.meaning} onChange={e => setNewWord({...newWord, meaning: e.target.value})} className="w-full bg-[#0D1117] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Ý nghĩa" />
            </div>
            <div className="col-span-1">
              <select value={newWord.type} onChange={e => setNewWord({...newWord, type: e.target.value})} className="w-full bg-[#0D1117] border border-slate-700 rounded-lg px-2 py-2 text-sm focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                <option value="N">Danh từ</option>
                <option value="V">Động từ</option>
                <option value="ADJ">Tính từ</option>
                <option value="ADV">Trạng từ</option>
                <option value="ADV">Lượng từ</option>
                <option value="ADV">Phó từ</option>
              </select>
            </div>
            <div className="col-span-3">
              <input value={newWord.example} onChange={e => setNewWord({...newWord, example: e.target.value})} className="w-full bg-[#0D1117] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Câu ví dụ tiếng Trung" />
            </div>
            <div className="col-span-3">
              <input value={newWord.exampleMeaning} onChange={e => setNewWord({...newWord, exampleMeaning: e.target.value})} className="w-full bg-[#0D1117] border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Nghĩa của ví dụ" />
            </div>
            <div className="col-span-1">
              <button onClick={handleAdd} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold flex items-center justify-center transition-all shadow-lg shadow-blue-600/20">
                <HiOutlinePlus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Bảng Danh Sách - Table View chuyên nghiệp */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-[#0D1117] text-slate-500  text-[10px] font-black tracking-[0.1em] border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 w-[15%] text-white">Hán tự / Pinyin</th>
                <th className="px-6 py-4 w-[15%] text-white">Nghĩa</th>
                <th className="px-6 py-4 w-[8%] text-center text-white">Loại</th>
                <th className="px-6 py-4 w-[20%] text-white">Ví dụ</th>
                <th className="px-6 py-4 w-[25%] text-white">Nghĩa ví dụ</th>
                <th className="px-6 py-4 w-[5%] text-center text-white">Lvl</th>
                <th className="px-6 py-4 w-[12%] text-right text-white">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {vocabList.map(v => (
                <tr key={v.vocaId} className="hover:bg-blue-500/[0.02] transition-colors group">
                  {editingId === v.vocaId ? (
                    /* CHẾ ĐỘ SỬA TRÊN 1 HÀNG */
                    <>
                      <td className="p-2 px-4"><input className="w-full bg-slate-800 border border-blue-500 rounded px-2 py-1 text-white mb-1" value={editForm.hanzi} onChange={e => setEditForm({...editForm, hanzi: e.target.value})} /><input className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400" value={editForm.pinyin} onChange={e => setEditForm({...editForm, pinyin: e.target.value})} /></td>
                      <td className="p-2 px-4"><input className="w-full bg-slate-800 border border-blue-500 rounded px-2 py-1 text-white" value={editForm.meaning} onChange={e => setEditForm({...editForm, meaning: e.target.value})} /></td>
                      <td className="p-2 px-4"><input className="w-full bg-slate-800 border border-slate-700 rounded px-1 py-1 text-center" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} /></td>
                      <td className="p-2 px-4"><textarea className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs" rows="2" value={editForm.example} onChange={e => setEditForm({...editForm, example: e.target.value})} /></td>
                      <td className="p-2 px-4"><textarea className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs " rows="2" value={editForm.exampleMeaning} onChange={e => setEditForm({...editForm, exampleMeaning: e.target.value})} /></td>
                      <td className="p-2 px-4 text-center"><input className="w-8 bg-slate-800 border border-slate-700 rounded py-1 text-center" value={editForm.level} onChange={e => setEditForm({...editForm, level: parseInt(e.target.value)})} /></td>
                      <td className="p-2 px-6 text-right space-x-2">
                        <button onClick={handleUpdate} className="text-green-500 hover:text-green-400"><HiOutlineCheck size={20}/></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-500 hover:text-white"><HiX size={20}/></button>
                      </td>
                    </>
                  ) : (
                    /* CHẾ ĐỘ HIỂN THỊ TRÊN 1 HÀNG */
                    <>
                      <td className="px-6 py-4">
                        <div className="text-xl text-blue-400 font-bold mb-0.5">{v.hanzi}</div>
                        <div className="text-[11px] text-slate-500 font-mono ">{v.pinyin}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-200">{v.meaning}</td>
                      <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-blue-500 rounded text-[10px] font-bold uppercase">{v.type}</span></td>
                      <td className="px-6 py-4 text-xs text-slate-400 leading-relaxed font-serif tracking-wide">{v.example || '---'}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 italic leading-relaxed">{v.exampleMeaning || '---'}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-600">{v.level}</td>
                      <td className="px-6 py-4 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button onClick={() => startEdit(v)} className="p-2 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"><HiOutlinePencil size={18} /></button>
                        <button onClick={() => handleDelete(v.vocaId)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><HiOutlineTrash size={18} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {vocabList.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-600">
               <HiOutlineInformationCircle size={40} className="mb-2 opacity-10" />
               <p className="italic text-sm">Bộ từ vựng này đang trống!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyDrawer;