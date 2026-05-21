//public bộ từ 
import React from 'react';

const PublishSetModal = ({
  isOpen,
  onClose,
  targetCategory,
  userData,
  vocabData,
  detectHSKLevel,
  publicColor,
  setPublicColor,
  publicPrice,
  setPublicPrice,
  publicIcon,
  setPublicIcon,
  publicTag,
  setPublicTag,
  publicDesc,
  setPublicDesc,
  onTogglePublic
}) => {
  if (!isOpen || !targetCategory) return null;

  // Lọc số từ và cấp độ HSK động dựa trên ID của bộ từ đang chọn
  const wordCount = vocabData?.filter(v => String(v.categoryID) === String(targetCategory?.categoryID)).length || 0;
  const hskLevel = detectHSKLevel ? detectHSKLevel(vocabData.filter(v => String(v.categoryID) === String(targetCategory?.categoryID))) : 'N/A';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[50px] p-8 shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* User Info Header */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-3">
            <img 
              src={userData?.avatar || `https://ui-avatars.com/api/?name=${userData?.name || 'U'}&background=FB923C&color=fff`} 
              className="w-10 h-10 rounded-full border-2 border-orange-100 shadow-sm object-cover" 
              alt="avatar" 
            />
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-800 uppercase tracking-tight">
                {userData?.name || "Người dùng Hanyu"}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {wordCount} Từ
              </span>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                {hskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Card Preview Area */}
        <div className="bg-white border border-gray-100 rounded-[40px] p-6 shadow-xl shadow-orange-500/5 mb-6 relative overflow-hidden">
          <div className={`w-full h-48 ${publicColor} rounded-[30px] mb-6 flex items-center justify-center relative transition-all duration-500`}>
            
            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm border border-white">
              <span className="text-red-500 text-xs">☀️</span>
              <input 
                type="number" 
                value={publicPrice} 
                onChange={(e) => setPublicPrice(e.target.value)}
                className="w-10 bg-transparent text-xs font-black text-red-500 outline-none border-none p-0 focus:ring-0"
              />
            </div>

            <div className="text-6xl transition-transform duration-300 hover:scale-110 select-none">
              {publicIcon}
            </div>

            {/* Tags */}
            <div className="absolute bottom-4 flex gap-2">
              <span className="bg-white/90 px-3 py-1 rounded-lg text-[9px] font-black text-slate-800 uppercase shadow-sm">#HSK</span>
              <input 
                type="text"
                placeholder="#Thêm_tag..."
                value={publicTag}
                onChange={(e) => setPublicTag(e.target.value)}
                className="bg-white/90 px-3 py-1 rounded-lg text-[9px] font-black text-slate-400 outline-none border-none focus:ring-1 focus:ring-orange-200 w-24"
              />
            </div>
          </div>

          <div className="px-2">
            <h5 className="text-2xl font-black text-gray-800 tracking-tighter mb-1 leading-tight">
              {targetCategory?.categoryName}
            </h5>
            <textarea 
              className="w-full bg-transparent p-0 text-sm font-bold text-gray-400 outline-none resize-none border-none focus:ring-0 placeholder:text-gray-200 leading-snug"
              value={publicDesc}
              onChange={(e) => setPublicDesc(e.target.value)}
              placeholder="Nhập mô tả bộ từ (Ví dụ: Tổng hợp ngữ pháp hay dùng)..."
              rows={2}
            />
          </div>
        </div>

        {/* Icon & Color Selection */}
        <div className="grid grid-cols-2 gap-4 mb-8 px-2">
          <div className="space-y-2">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Biểu tượng</span>
            <div className="flex gap-2">
              {['📚', '🏮', '🉐', '🔥', '🐉'].map(item => (
                <button 
                  type="button"
                  key={item} 
                  onClick={() => setPublicIcon(item)} 
                  className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 border-2 transition-all ${publicIcon === item ? 'border-orange-500 bg-orange-50' : 'border-transparent'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Nền chủ đề</span>
            <div className="flex gap-2">
              {['bg-[#ECFAF3]', 'bg-orange-50', 'bg-blue-50', 'bg-purple-50', 'bg-rose-50'].map(c => (
                <button 
                  type="button"
                  key={c} 
                  onClick={() => setPublicColor(c)} 
                  className={`w-6 h-6 rounded-full ${c} border-2 ${publicColor === c ? 'border-slate-800' : 'border-transparent'}`} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 py-4 text-gray-400 font-black text-[11px] uppercase tracking-widest hover:text-gray-600 transition-all"
          >
            Đóng
          </button>
          
          {!targetCategory?.isBorrowed && (
            <button 
              type="button"
              onClick={onTogglePublic} 
              className="flex-[2] py-4 rounded-[22px] font-black text-[11px] uppercase tracking-widest transition-all bg-[#00C25B] text-white shadow-xl hover:bg-[#00ab50] active:scale-95"
            >
              {targetCategory?.isPublic ? "Cập nhật bài đăng" : "Đăng ngay"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublishSetModal;