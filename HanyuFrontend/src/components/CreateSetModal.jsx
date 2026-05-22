import React, { useState, useEffect } from 'react';
import { HiOutlineFolderAdd, HiOutlineCheck } from 'react-icons/hi';

const CreateSetModal = ({
  isOpen,
  onClose,
  newCategoryName,
  setNewCategoryName,
  onCreate,
  loading
}) => {
  // Thêm state để quản lý hiệu ứng chuyển màu xanh khi lưu thành công
  const [isSuccess, setIsSuccess] = useState(false);

  // Khi modal đóng, reset trạng thái success về ban đầu cho lần mở sau
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Hàm trung gian kích hoạt hiệu ứng xanh thành công
  const handleInternalCreate = async () => {
    try {
      await onCreate(); // Đợi API ở file cha chạy xong ngon lành
      setIsSuccess(true); // Bật màu xanh lá!
    } catch (err) {
      // Nếu lỗi thì hàm onCreate ở file cha sẽ bắn alert, nút vẫn giữ nguyên màu đỏ
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 border border-white animate-in zoom-in-95 duration-200">
        
        <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 uppercase">
          <HiOutlineFolderAdd size={24} className={isSuccess ? "text-green-600 transition-colors" : "text-red-600 transition-colors"} /> 
          Tạo bộ từ mới
        </h4>
        
        <input 
          type="text" 
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Tên bộ từ ..." 
          disabled={loading || isSuccess}
          className="w-full pt-4 pb-3.5 px-5 bg-gray-50 border border-transparent rounded-xl outline-none font-bold focus:border-red-200 transition-all disabled:opacity-50 text-sm" 
        />
        
        <div className="flex gap-4 mt-8">
          <button 
            type="button"
            onClick={onClose} 
            disabled={loading || isSuccess}
            className="flex-1 py-4 text-xs font-black text-gray-400 uppercase hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          
          <button 
            type="button"
            onClick={handleInternalCreate} 
            disabled={loading || isSuccess || !newCategoryName.trim()} 
            className={`flex-1 py-4 text-white rounded-[20px] font-black text-xs active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
              isSuccess 
                ? 'bg-green-600 shadow-lg shadow-green-100' // Biến hình màu xanh lá cây cực mượt
                : loading || !newCategoryName.trim()
                  ? 'bg-gray-300 shadow-none cursor-not-allowed text-gray-400' 
                  : 'bg-red-600 shadow-lg shadow-red-100 hover:bg-red-700'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang tạo...</span>
              </>
            ) : isSuccess ? (
              <>
                <HiOutlineCheck size={16} className="animate-bounce" />
                <span>Thành công!</span>
              </>
            ) : (
              'Tạo ngay'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateSetModal;