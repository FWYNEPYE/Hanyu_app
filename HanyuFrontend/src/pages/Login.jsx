import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiLockClosed, HiUser } from "react-icons/hi";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate('/admin-portal', { replace: true });
    }
  }, [navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post("http://localhost:5252/api/auth/admin-login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("username", res.data.username); 
      localStorage.setItem("role", "Admin"); 
      
      navigate('/admin-portal'); 
      
    } catch (err) {
      console.error("Lỗi đăng nhập Admin:", err);
      alert("Sai tài khoản hoặc mật khẩu rồi sếp ơi!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center font-sans overflow-hidden"
      style={{ backgroundImage: "url('/bglogin.png')", backgroundSize: '' }}>
      
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px] z-0"></div>

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Logo */}
        <div className="mb-8 group">
          <div className="bg-white w-20 h-20 rounded-[28px] shadow-2xl flex items-center justify-center overflow-hidden border-2 border-white transition-all duration-300">
            <img src="/hehe.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-md w-full max-w-[380px] rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-[#2d3436] tracking-tight">ADMIN </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Hệ thống quản trị</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            {/* Username */}
            <div className="relative">
              <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                required
                placeholder="Tên đăng nhập"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#ff416c] focus:bg-white outline-none transition-all text-sm font-bold"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password"
                required
                placeholder="Mật khẩu"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#ff416c] focus:bg-white outline-none transition-all text-sm font-bold"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white rounded-2xl font-black text-sm shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
            >
              {isLoading ? "ĐANG XÁC THỰC..." : "ĐĂNG NHẬP"}
            </button>
          </form>

          <button 
            onClick={() => navigate('/')}
            className="mt-6 w-full text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors"
          >
            QUAY LẠI TRANG CHỦ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;