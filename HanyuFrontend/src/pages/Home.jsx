import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google'; 
import axios from 'axios';
import { 
  HiOutlineSearch, 
  HiOutlineAcademicCap, 
  HiOutlineLightningBolt, 
  HiOutlineChartBar,
  HiOutlineChatAlt2,
  HiOutlineClock,
  HiX
} from "react-icons/hi";

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  //bắt lỗi token khi đăng nhập vào 
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
   
    navigate('/dashboard', { replace: true }); 
  }
}, [navigate]);



  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google Token:", tokenResponse);
      
      try {
        // Lấy thông tin user từ Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        // Gửi sang Backend 
        const res = await axios.post("http://localhost:5252/api/Auth/google-login", {
          email: userInfo.data.email,
          name: userInfo.data.name,
          googleId: userInfo.data.sub,
          photoUrl: userInfo.data.picture
        });

        // Lưu token
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        
        // Bay thẳng vào Dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        alert("Ốiiiiiii, bị lỗi rồi!");
      }
    },
    onError: () => console.log('Login Failed'),
  });

  return (
    <div className="relative min-h-screen bg-white font-sans text-[#2d3436] overflow-x-hidden">
      
      {/*TRANG HOME */}
      <div className={`transition-all duration-700 ${showLogin ? 'blur-md scale-[0.98] select-none pointer-events-none' : ''}`}>
        
        {/* NAVBAR */}
        <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-gray-100 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden">
              <img src="/logoo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-lg md:text-xl tracking-tighter uppercase">Hanyu</span>
          </div>
          
          <button 
            onClick={() => setShowLogin(true)}
            className="bg-red-600 text-white px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-[0_4px_0_0_rgba(185,28,28,1)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all shrink-0"
          >
            Bắt đầu <span className="hidden sm:inline">học ngay</span>
          </button>
        </nav>

        {/* HERO SECTION */}
        <section className="pt-44 pb-24 px-6 text-center bg-gradient-to-b from-red-50/50 to-white">
          <div className="inline-block px-4 py-2 bg-pink-50 text-pink-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            Hệ thống hỗ trợ học tiếng Trung thông minh
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] max-w-5xl mx-auto mb-10 text-[#2d3436]">
            Làm chủ tiếng Trung <br/> chưa bao giờ <span className="text-red-600 italic">dễ đến thế</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
            Học tập cá nhân, tra từ vựng, luyện phản xạ và hội thoại cùng AI mỗi ngày.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button 
              onClick={() => setShowLogin(true)}
              className="px-12 py-5 bg-[#b91c1c] text-white rounded-[25px] font-black text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-xl shadow-red-100"
            >
              Trải nghiệm miễn phí
            </button>
          </div>
        </section>

        
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4 text-[#2d3436]">Học tiếng Trung mọi lúc, mọi nơi!</h2>
            <div className="w-20 h-1.5 bg-red-600 mx-auto rounded-full"></div>
          </div>

          {/* HÀNG TRÊN: 3 CARD  */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Tra từ vựng */}
            <div className="p-8 bg-[#fff5f5] rounded-[40px] border border-gray-50 hover:shadow-2xl hover:shadow-red-100 transition-all group">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-sm">
                <HiOutlineSearch size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">Tra từ vựng AI</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Giải nghĩa chi tiết, ví dụ thực tế và cách dùng từ chuẩn xác nhờ AI.</p>
            </div>

            {/* Bộ từ vựng */}
            <div className="p-8 bg-[#fff0f6] rounded-[40px] border border-gray-50 hover:shadow-2xl hover:shadow-pink-100 transition-all group">
              <div className="w-14 h-14 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-sm">
                <HiOutlineAcademicCap size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">Bộ từ vựng</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Hệ thống thẻ từ vựng thông minh với âm thanh chuẩn.</p>
            </div>

            {/* Game phản xạ */}
            <div className="p-8 bg-[#fff9db] rounded-[40px] border border-gray-50 hover:shadow-2xl hover:shadow-yellow-100 transition-all group">
              <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-sm">
                <HiOutlineLightningBolt size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">Game phản xạ</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Vừa học vừa chơi với các mini-game giúp ghi nhớ mặt chữ siêu tốc.</p>
            </div>
          </div>

          {/* HÀNG DƯỚI: 3 CARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hội thoại AI */}
            <div className="p-8 bg-[#e7f5ff] rounded-[40px] border border-gray-50 hover:shadow-2xl hover:shadow-blue-100 transition-all group">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-sm">
                <HiOutlineChatAlt2 size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">Hội thoại AI</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Luyện nói tiếng Trung 24/7 cùng trợ lý ảo, sửa lỗi phát âm ngay lập tức.</p>
            </div>

            {/* Hệ thống nhắc lại */}
            <div className="p-8 bg-[#e6fff7] rounded-[40px] border border-green-100 hover:shadow-2xl hover:shadow-green-100 transition-all group relative overflow-hidden">
              <div className="w-14 h-14 bg-white text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform relative z-10 shadow-sm shadow-green-100">
                  <HiOutlineClock size={28} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white"></div>
              </div>
              <h3 className="text-xl font-black mb-3 relative z-10">Hệ thống nhắc lại</h3>
              <p className="text-sm text-gray-500 font-medium relative z-10">Ghi nhớ từ vựng lâu dài thông qua thuật toán lặp lại ngắt quãng thông minh.</p>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-green-200 rounded-full opacity-20"></div>
            </div>

            {/* Bảng xếp hạng */}
            <div className="p-8 bg-[#fff4e6] rounded-[40px] border border-gray-50 hover:shadow-2xl hover:shadow-orange-100 transition-all group">
              <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-sm">
                <HiOutlineChartBar size={28} />
              </div>
              <h3 className="text-xl font-black mb-3">Bảng xếp hạng</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">Thi đua cùng cộng đồng học viên, tích lũy điểm thưởng và thăng hạng.</p>
            </div>
          </div>
        </section>

        <footer className="py-12 border-t border-gray-50 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">© 2026 Hanyu Project</p>
        </footer>
      </div>

      {/* MODAL LOGIN */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-white/40 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          ></div>

          <div className="relative z-10 flex flex-col items-center w-full animate-in zoom-in-95 duration-300">
            <div className="mb-8 group cursor-pointer relative">
              <div className="bg-white w-20 h-20 sm:w-24 sm:h-24 rounded-[28px] 
                            shadow-[0_15px_35px_rgba(0,0,0,0.15)] 
                            flex items-center justify-center overflow-hidden border border-gray-100 
                            group-hover:-translate-y-1 transition-all duration-300">
                <img src="/logoo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="bg-white w-full max-w-[340px] sm:max-w-[400px] rounded-[40px] sm:rounded-[45px] p-8 sm:p-10 
                          shadow-[0_20px_50px_rgba(0,0,0,0.12),0_40px_80px_rgba(0,0,0,0.18)] 
                          border border-white/50 text-center relative">
              
              <button 
                onClick={() => setShowLogin(false)}
                className="absolute top-6 right-8 text-gray-300 hover:text-red-600 transition-colors"
              >
                <HiX size={24} />
              </button>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#2d3436] mb-2 tracking-tight leading-tight">
                Đăng nhập
              </h1>

              <p className="text-gray-400 text-[13px] sm:text-sm mb-10 font-normal leading-relaxed block w-full px-2">
               Dậy học ngay đê!!!
              </p>

              {/* NÚT GOOGLE  */}
              <button 
                onClick={() => login()} 
                className="w-full flex items-center justify-center space-x-3 
                           bg-white border-2 border-gray-50 py-3 sm:py-3.5 rounded-2xl 
                           shadow-[0_5px_0_0_rgba(82,184,72,1)] 
                           hover:shadow-[0_7px_0_0_rgba(82,184,72,1)] 
                           hover:-translate-y-1 transition-all duration-300 
                           active:shadow-[0_2px_0_0_rgba(82,184,72,1)] active:translate-y-0.5 group"
              >
                <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
                <span className="text-[#2d3436] font-bold text-sm sm:text-base">Tiếp tục với Google</span>
              </button>

              <p className="mt-8 sm:mt-10 text-gray-500 text-sm sm:text-base leading-relaxed">
                Đã đăng nhập vào đây là phải 
                <span className="text-blue-600 font-extrabold ml-1"> HỌC</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;