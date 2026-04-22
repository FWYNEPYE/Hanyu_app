import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineSave, HiOutlineLockClosed, HiOutlineLightningBolt } from "react-icons/hi";
import { Toaster, toast } from 'react-hot-toast'; 

const SystemConfig = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    ApiKey: '',
    ModelVersion: 'llama-3.1-8b-instant',
    MaintenanceMode: 'false',
    AllowRegistration: 'true'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:5252/api/AdminConfigs');
      if (res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (error) {
      toast.error("Không thể tải cấu hình từ server!");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5252/api/AdminConfigs/update', settings);
      toast.success("Đã lưu thay đổi vào Database!");
    } catch (error) {
      toast.error("Lỗi khi lưu cấu hình!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl space-y-8 p-4">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Cấu hình Hệ thống</h2>
        <button 
          onClick={handleSave}
          disabled={loading}
          className={`${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-500'} text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all`}
        >
          {loading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> : <HiOutlineSave />}
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* AI CONFIG */}
        <div className="bg-[#161B26] p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 text-blue-400 font-bold border-b border-slate-800 pb-4">
            <HiOutlineLightningBolt /> <span>Cấu hình AI (Groq/Gemini)</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Groq API KEY</label>
              <input 
                type="text" 
                value={settings.ApiKey}
                onChange={(e) => handleChange('ApiKey', e.target.value)}
                placeholder="Nhập API Key mới..."
                className="w-full bg-[#0B0F1A] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 focus:border-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-bold uppercase block mb-2">Model Version</label>
              <select 
                value={settings.ModelVersion}
                onChange={(e) => handleChange('ModelVersion', e.target.value)}
                className="w-full bg-[#0B0F1A] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-300 outline-none"
              >
                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast)</option>
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Smart)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECURITY & STATUS */}
        <div className="bg-[#161B26] p-8 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 text-rose-400 font-bold border-b border-slate-800 pb-4">
            <HiOutlineLockClosed /> <span>Trạng thái & Bảo mật</span>
          </div>
          <div className="space-y-6">
            {/* Maintenance Mode Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-white">Chế độ Bảo trì</p>
                <p className="text-xs text-slate-500">Người dùng sẽ không thể truy cập</p>
              </div>
              <div 
                onClick={() => handleChange('MaintenanceMode', settings.MaintenanceMode === 'true' ? 'false' : 'true')}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.MaintenanceMode === 'true' ? 'bg-rose-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.MaintenanceMode === 'true' ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

            {/* Registration Toggle */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-white">Đăng ký thành viên</p>
                <p className="text-xs text-slate-500">Mở cổng đăng ký tự động</p>
              </div>
              <div 
                onClick={() => handleChange('AllowRegistration', settings.AllowRegistration === 'true' ? 'false' : 'true')}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.AllowRegistration === 'true' ? 'bg-blue-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.AllowRegistration === 'true' ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;