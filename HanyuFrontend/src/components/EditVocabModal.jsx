import React, { useLayoutEffect, useRef, useState } from 'react';
import { HiOutlinePencilAlt, HiCheck } from 'react-icons/hi';

const EditVocabModal = ({ editingWord, setEditingWord, onCancel, onUpdate }) => {
  const textareasRef = useRef([]);
  const [buttonState, setButtonState] = useState('idle');

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

  const handleSaveClick = async () => {
    if (buttonState !== 'idle') return;

    try {
      setButtonState('loading');
      
      if (onUpdate) {
        await onUpdate(); 
      }

      setButtonState('success');

      // Đợi đúng 1.5 giây để nhìn thấy chữ ĐÃ LƯU XONG mượt mà rồi mới tự đóng modal
      setTimeout(() => {
        setButtonState('idle');
        onCancel(); 
      }, 1500);

    } catch (error) {
      setButtonState('idle');
      console.error("Lưu từ vựng thất bại:", error);
    }
  };

  const inputClass = "w-full pt-3 pb-2 px-3 bg-gray-50 rounded-xl font-bold outline-none resize-none overflow-hidden border border-transparent focus:border-red-200 transition-all text-sm leading-normal";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[500px] rounded-[40px] shadow-2xl p-5 border border-white flex flex-col max-h-[90vh]">
        
        <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 uppercase flex-shrink-0">
          <HiOutlinePencilAlt className="text-red-600" size={22}/> Chỉnh sửa
        </h4>

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

        <div className="flex gap-4 pt-4 border-t border-gray-100 flex-shrink-0">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={buttonState === 'loading'}
            className="flex-1 py-4 text-xs font-black text-gray-400 uppercase hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          
          <button 
            type="button"
            onClick={handleSaveClick} 
            disabled={buttonState === 'loading' || buttonState === 'success'}
            className={`flex-1 py-4 rounded-[20px] font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-white ${
              buttonState === 'success' 
                ? 'bg-emerald-500 shadow-emerald-200' 
                : 'bg-red-600 shadow-red-100'
            }`}
          >
            {buttonState === 'idle' && "LƯU THAY ĐỔI"}
            
            {buttonState === 'loading' && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            
            {buttonState === 'success' && (
              <>
                <HiCheck size={16} className="animate-bounce" />
                ĐÃ LƯU XONG!
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVocabModal;