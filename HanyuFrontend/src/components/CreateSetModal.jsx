import React from 'react';
import { HiOutlineFolderAdd } from 'react-icons/hi';

const CreateSetModal = ({
  isOpen,
  onClose,
  newCategoryName,
  setNewCategoryName,
  onCreate,
  loading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-200">
        
        <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 uppercase">
          <HiOutlineFolderAdd size={28} className="text-red-600" /> Tạo bộ từ mới
        </h4>
        
        <input 
          type="text" 
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Tên bộ từ ..." 
          disabled={loading}
          className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:border-red-500 transition-all disabled:opacity-50" 
        />
        
        <div className="flex gap-4 mt-10">
          <button 
            type="button"
            onClick={onClose} 
            disabled={loading}
            className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase hover:bg-gray-200 transition-all"
          >
            Hủy
          </button>
          
          <button 
            type="button"
            onClick={onCreate} 
            disabled={loading || !newCategoryName.trim()} 
            className={`flex-1 py-5 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all uppercase ${
              loading || !newCategoryName.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Đang tạo...' : 'Tạo ngay'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateSetModal;