import React, { useLayoutEffect, useRef } from 'react';
import { HiOutlinePencilAlt } from 'react-icons/hi';

const EditVocabModal = ({ editingWord, setEditingWord, onCancel, onUpdate }) => {
  const textareasRef = useRef([]);

  const adjustHeight = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    textareasRef.current.forEach((el) => adjustHeight(el));
  }, [editingWord]);

  const handleChange = (key, value) => {
    setEditingWord({ ...editingWord, [key]: value });
  };

 // Class mới: loại bỏ min-h-[44px] cố định, để nó tự co giãn theo nội dung (text)
const inputClass = "w-full px-3 py-2 bg-gray-50 rounded-xl font-bold outline-none resize-none overflow-hidden border border-transparent focus:border-red-200 transition-all text-sm";


  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-200">
      
      <div className="bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl p-5 border border-white flex flex-col max-h-[90vh]">
        
        <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 uppercase flex-shrink-0">
          <HiOutlinePencilAlt className="text-red-600" size={22}/> Chỉnh sửa
        </h4>

        {/* Thêm style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
          và class '&::-webkit-scrollbar': { display: 'none' } 
          để ẩn thanh cuộn mà vẫn cuộn được 
        */}
        <div 
          className="flex-1 overflow-y-auto space-y-6 pr-2"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
          }}
        >
          <style>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-2">Hán tự</label>
              <textarea 
                ref={el => textareasRef.current[0] = el}
                onInput={(e) => adjustHeight(e.target)}
                value={editingWord.hanzi || ''} 
                onChange={(e) => handleChange('hanzi', e.target.value)} 
                className={`${inputClass} text-xl`} 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-2">Pinyin</label>
              <textarea 
                ref={el => textareasRef.current[1] = el}
                onInput={(e) => adjustHeight(e.target)}
                value={editingWord.pinyin || ''} 
                onChange={(e) => handleChange('pinyin', e.target.value)} 
                className={`${inputClass} text-red-500`} 
              />
            </div>
          </div>

          {[
            { label: 'Loại từ', key: 'type' },
            { label: 'Nghĩa', key: 'meaning' },
            { label: 'Ví dụ', key: 'example' },
            { label: 'Ghi chú', key: 'note' }
          ].map((field, index) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-2">{field.label}</label>
              <textarea 
                ref={el => textareasRef.current[index + 2] = el}
                onInput={(e) => adjustHeight(e.target)}
                value={editingWord[field.key] || ''} 
                onChange={(e) => handleChange(field.key, e.target.value)} 
                className={`${inputClass} font-medium`} 
              />
            </div>
          ))}
        </div>

        <div className=" flex gap-4 pt-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onCancel} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase hover:bg-gray-50 rounded-xl transition-all">Hủy</button>
          <button onClick={onUpdate} className="flex-1 py-4 bg-red-600 text-white rounded-[20px] font-black text-xs shadow-lg active:scale-95 transition-all">LƯU THAY ĐỔI</button>
        </div>
      </div>
    </div>
  );
};

export default EditVocabModal;