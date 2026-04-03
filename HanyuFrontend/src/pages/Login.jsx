import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google'; 
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    // Nếu có token rồi sang dashboard, khỏi login
    navigate('/dashboard', { replace: true }); 
  }
}, [navigate]);

  // Logic xử lý sau khi Google cấp quyền thành công
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google Token:", tokenResponse);
      
      try {
        // 1. Lấy thông tin user từ Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        // 2. Gửi dữ liệu sang Backend .NET của mày
        const res = await axios.post("http://localhost:5252/api/auth/google-login", {
          Email: userInfo.data.email,
          Name: userInfo.data.name,
          GoogleId: userInfo.data.sub,
          PhotoUrl: userInfo.data.picture
        });

        // 3. Lưu lại token
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        
        // 4. Bay vào Dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        alert("Đm lỗi rồi, check lại Backend hoặc Client ID đi!");
      }
    },
    onError: () => console.log('Login Failed'),
  });

  return (
    <div 
        className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center font-sans overflow-hidden bg-no-repeat bg-center bg-[length:100%_100%]"
        style={{ backgroundImage: "url('/bglogin.png')" }}>
      
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-0"></div>

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Logo Section */}
        <div className="mb-8 sm:mb-10 group cursor-pointer relative">
          <div className="bg-white w-20 h-20 sm:w-24 sm:h-24 rounded-[28px] 
                        shadow-[0_15px_35px_rgba(0,0,0,0.15)] 
                        flex items-center justify-center overflow-hidden border border-gray-100 
                        group-hover:-translate-y-1 transition-all duration-300">
            <img src="/logoo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white w-full max-w-[340px] sm:max-w-[400px] rounded-[40px] sm:rounded-[45px] p-8 sm:p-10 
                      shadow-[0_20px_50px_rgba(0,0,0,0.12),0_40px_80px_rgba(0,0,0,0.18)] 
                      border border-white/50 text-center transition-all">
          
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2d3436] mb-2 tracking-tight leading-tight">
            Đăng nhập
          </h1>

          <p className="text-gray-400 text-[14px] sm:text-sm mb-10 font-normal leading-relaxed">
            Dậy học ngay đê!!!
          </p>

          {/* nút đăng nhập bằng gg */}
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
  );
};

export default Login;