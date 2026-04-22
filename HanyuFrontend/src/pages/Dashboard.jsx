import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  HiMenuAlt3, HiOutlineBookOpen, HiOutlineLightningBolt, HiOutlineChatAlt2, HiOutlineDesktopComputer,
  HiOutlineLogout, HiOutlineBell, HiOutlineSearch, HiMenuAlt2, HiX, HiOutlineX, 
  HiOutlineHome, HiOutlineMail, HiOutlineCalendar, HiOutlineRefresh
} from "react-icons/hi";
import { PiMedalLight } from "react-icons/pi";
import CoinFly from '../components/CoinFly';

const Dashboard = () => {
  const [open, setOpen] = useState(true);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); //đxuat

  const [notifications, setNotifications] = useState([]);

  
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [showCoinFly, setShowCoinFly] = useState(false);

  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    name: "Đang tải...",
    email: "...",
    avatar: "https://ui-avatars.com/api/?name=U&background=fff&color=EF4444",
    joinDate: "...",
    points: 0,          
    availableAIUsage: 0
  });

  const [tempName, setTempName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const triggerCoinFly = () => {
    setShowCoinFly(true);
    // Sau 2.5 giây thì dọn dẹp để lần sau bấm lại nó vẫn hiện
    setTimeout(() => setShowCoinFly(false), 2500);
  };

//connect
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      
      const res = await axios.get("http://localhost:5252/api/User/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setTempName(res.data.name);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  useEffect(() => { fetchUserData(); }, []);

  // ---CẬP NHẬT TÊN ---
  const handleUpdateName = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5252/api/User/update-name", 
        { newName: tempName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, name: tempName });
      //alert("Cập nhật tên thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật tên!");
    }
  };

//đổi đỉm
const handleExchange = async (cost, amount) => {
  try {
    const token = localStorage.getItem("token");
    
    // Gửi đúng một object có 2 trường cost và amount
    const response = await axios.post("http://localhost:5252/api/User/exchange-credits", 
      { 
        cost: Number(cost), 
        amount: Number(amount) 
      },
      { 
        headers: { Authorization: `Bearer ${token}` } 
      }
    );

    if (response.status === 200) {
      await fetchUserData(); // Load lại tiền trên Header
      alert("Đổi thành công rồi nhé!");
      setIsShopOpen(false);
    }
  } catch (err) {
    // Đoạn này giúp mày nhìn thấy Backend đang chửi gì nè
    console.error("Lỗi chi tiết:", err.response?.data);
    alert(err.response?.data?.message || "Lỗi rồi mày ơi!");
  }
};


const handleAddPoints = async (amount) => {
    try {
        const token = localStorage.getItem("token");
        await axios.post("http://localhost:5252/api/User/add-points", 
            { pointsToAdd: amount }, // Gửi đúng tên field là pointsToAdd
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        fetchUserData(); // Cập nhật lại Header ngay lập tức
    } catch (err) {
        console.error("Lỗi cộng điểm:", err.response?.data);
    }
};

useEffect(() => {
  // Hàm này sẽ được gọi khi CommunityPage bắn tín hiệu
  const handleUpdatePoints = () => {
    console.log("Phát hiện thay đổi điểm, đang tải lại dữ liệu...");
    fetchUserData(); // Gọi lại API để lấy user profile mới nhất (có điểm mới)
  };

  // Lắng nghe cả event 'storage' (cho tab khác) và 'updatePoints' (cho tab hiện tại)
  window.addEventListener("storage", handleUpdatePoints);
  window.addEventListener("updatePoints", handleUpdatePoints);

  return () => {
    window.removeEventListener("storage", handleUpdatePoints);
    window.removeEventListener("updatePoints", handleUpdatePoints);
  };
}, []);



  // ---  CẬP NHẬT AVATAR ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5252/api/User/update-avatar", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` 
        }
      });
      setUser({ ...user, avatar: res.data.newAvatarUrl });
    } catch (err) {
      alert("Lỗi khi upload ảnh!");
    }
  };

  //thông báo
  const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5252/api/Notification/user-notifications", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(res.data);
  } catch (err) {
    console.error("Lỗi lấy thông báo:", err);
  }
};

const handleMarkAsRead = async (notiId) => {
  if (!notiId) return;

  try {
    const token = localStorage.getItem("token");
    // Gọi API cập nhật DB
    await axios.post(`http://localhost:5252/api/Notification/mark-as-read/${notiId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setNotifications(prev => 
      prev.map(n => n.notiId === notiId ? { ...n, isRead: true } : n)
    );
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái đã đọc:", err);
  }
};



useEffect(() => {
  fetchNotifications();
  // Cứ mỗi 2 phút check thông báo mới một lần cho nó "bảnh"
  const interval = setInterval(fetchNotifications, 120000);
  return () => clearInterval(interval);
}, []);


  // Logic Game
  useEffect(() => {
    if (!location.pathname.includes('/dashboard/game')) {
      window.is_playing = false;
      localStorage.removeItem('show_exit_trigger');
      localStorage.removeItem('pending_route');
    }
  }, [location.pathname]);

  const isDashboardHome = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const isPlayingGame = location.pathname.includes('/game/play');
const unreadCount = notifications.filter(n => !n.isRead).length;
  

  const menus = [
    { name: "Trang chủ", link: "/dashboard", icon: HiOutlineHome, color: "text-blue-500" },
    { name: "Tra từ vựng", link: "/dashboard/search", icon: HiOutlineSearch, color: "text-purple-500" },
    { name: "Bộ từ vựng", link: "/dashboard/vocabulary", icon: HiOutlineBookOpen, color: "text-emerald-500"},
    { name: "Game phản xạ", link: "/dashboard/game", icon: HiOutlineLightningBolt, color: "text-orange-500" },
    { name: "Xem video phụ đề", link: "/dashboard/video", icon: HiOutlineDesktopComputer, color: "text-sky-500" }, //new
    { name: "Bảng xếp hạng", link: "/dashboard/leaderboard", icon: PiMedalLight, color: "text-red-500", margin: true },
   // { name: "Chat cùng AI", link: "/dashboard/ai-chat", icon: HiOutlineChatAlt2, color: "text-indigo-500" },
  ];


  return (
    
    <div className="flex bg-[#f3f5f8] min-h-screen font-sans text-[#2d3436] relative antialiased">
      
      {/* ---  MODAL PROFILE  --- */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsProfileOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <button  onClick={() => setIsProfileOpen(false)}
               className="absolute top-5 right-5 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white md:text-gray-400 md:hover:text-red-500 rounded-full transition-all">
              <HiX size={20} />
            </button>
            
            {/* Nền */}
            <div className="h-28 bg-gradient-to-r from-blue-100 via-pink-100 to-yellow-100 w-full" />
            
            <div className="px-8 pb-10 text-center">
              <div className="relative -mt-14 flex justify-center">
                {/* Avatar */}
                <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-2xl flex items-center justify-center overflow-hidden">
                    <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-2xl font-black text-gray-800 tracking-tight">{user.name}</h3>
                
              </div>

              <div className="mt-8 space-y-3">
                <div className="bg-gray-50/50 p-4 rounded-[24px] border border-gray-100 flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><HiOutlineMail size={20} /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Email đăng nhập</p>
                    <p className="text-sm font-bold text-gray-700">{user.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-4 rounded-[24px] border border-gray-100 flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><HiOutlineCalendar size={20} /></div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ngày tham gia</p>
                    <p className="text-sm font-bold text-gray-700">{user.joinDate}</p>
                  </div>
                </div>

                <div className="mt-6 p-1 bg-gray-50 rounded-[28px] border border-gray-100 flex items-center">
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="flex-1 bg-transparent px-5 py-3 outline-none font-bold text-sm text-gray-700" placeholder="Đổi tên..." />
                  <button onClick={handleUpdateName} className="px-6 py-3 bg-red-500 text-white rounded-[24px] font-black text-xs hover:bg-red-600 shadow-lg">LƯU</button>
                </div>

                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                <button onClick={() => fileInputRef.current.click()} className="w-full mt-4 flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-gray-200 rounded-[30px] text-gray-400 font-bold text-sm hover:text-red-500 transition-all group">
                  <HiOutlineRefresh size={18} className="group-hover:rotate-180 duration-500" /> Cập nhật ảnh đại diện
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---  MODAL ĐĂNG XUẤT --- */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsLogoutModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[35px] p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <HiOutlineLogout size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-800">Đăng xuất?</h3>
            <p className="text-gray-500 font-bold text-sm mt-2">Muốn đăng xuất thật hả ???</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs">Ở LẠI</button>
              <button 
                onClick={() => { localStorage.clear(); navigate('/login'); }} 
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-red-100"
              >
                THOÁT LUÔN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR THÔNG BÁO  --- */}
      {isNotiOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsNotiOpen(false)} />
          <div className="relative w-full max-w-[350px] sm:max-w-[400px] bg-[#F9FAFF] h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col rounded-l-[40px]">
            <div className="p-8 flex items-center justify-between bg-white border-b border-gray-100 rounded-tl-[40px]">
              <div className="text-left">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Thông báo</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Có {notifications.length} tin mới</p>
              </div>
              <button onClick={() => setIsNotiOpen(false)} className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
                <HiOutlineX size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((noti) => {
                    const id = noti.notiId; 
                    const isStreak = noti.type?.toUpperCase() === 'STREAK';
                    const isRead = noti.isRead;

                    return (
                      <div 
                        key={id} 
                        onClick={() => handleMarkAsRead(id)} 
                        className={`group p-5 rounded-[25px] border-l-4 transition-all duration-300 cursor-pointer text-left
                          ${isRead 
                            ? 'bg-gray-50/50 border-gray-200 opacity-60 shadow-none' 
                            : isStreak 
                              ? 'bg-orange-50 border-orange-500 shadow-lg shadow-orange-100' 
                              : 'bg-white border-red-500 shadow-md hover:shadow-lg'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-[10px] font-black uppercase tracking-widest
                            ${isRead ? 'text-gray-400' : isStreak ? 'text-orange-600' : 'text-red-500'}`}>
                            {isStreak ? '🔥 ' : '🔔 '} {noti.type}
                          </p>
                          
                          {/* Dấu chấm báo hiệu chưa đọc */}
                          {!isRead && (
                            <span className="relative flex h-2 w-2">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isStreak ? 'bg-orange-400' : 'bg-red-400'}`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${isStreak ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                            </span>
                          )}
                        </div>

                        <h4 className={`text-sm font-black leading-tight mb-1 transition-colors
                          ${isRead ? 'text-gray-500' : 'text-gray-800'}`}>
                          {noti.title}
                        </h4>

                        <p className={`text-xs font-medium leading-relaxed
                          ${isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                          {noti.content}
                        </p>

                        <div className="flex justify-between items-center mt-3 border-t border-gray-100 pt-2">
                          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter">
                            {new Date(noti.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-[9px] text-gray-300 font-bold">{new Date(noti.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl opacity-50">📭</span>
                    </div>
                    <p className="text-gray-400 font-black text-xs uppercase tracking-widest"> Không có tin mới!</p>
                  </div>
                )}
              </div>
          </div>
        </div>
      )}



      {/* --- SIDEBAR CHÍNH  --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-xl duration-500 px-4 flex flex-col transform
        ${open ? "translate-x-0 w-72" : "-translate-x-full w-72"}
        ${isPlayingGame ? "hidden md:flex" : "md:relative md:translate-x-0 md:flex"}
        ${open ? "md:w-72" : "md:w-20"}
      `}>
        <div className="py-3 hidden md:flex justify-end">
          <HiMenuAlt3 size={26} className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => setOpen(!open)} />
        </div>
        <div className="py-3 flex md:hidden justify-end">
          <button onClick={() => setOpen(false)} className="p-2 text-gray-400"><HiX size={26} /></button>
        </div>

        <div className="mt-4 flex flex-col items-center shrink-0">
          <div className={`duration-500 bg-gray-50 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden ${open ? "w-16 h-16" : "w-10 h-10 md:w-10"}`}>
             <img src="/hehe.png" alt="logo" className="w-full h-full object-cover" />
          </div>
          <h2 className={`whitespace-pre duration-500 font-black mt-3 tracking-tighter ${!open && "md:opacity-0 md:translate-x-28"}`}>HANYU</h2>
        </div>

        <div className="mt-8 flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar">
          {menus.map((menu, i) => {
            const isActive = menu.link === "/dashboard" 
              ? currentPath === "/dashboard" || currentPath === "/dashboard/"
              : currentPath.startsWith(menu.link);

            return (
              <button 
                key={i} onClick={() => {
                  if (window.is_playing === true) {
                    localStorage.setItem('pending_route', menu.link);
                    localStorage.setItem('show_exit_trigger', Date.now().toString());
                  } else {
                    navigate(menu.link);
                    if (window.innerWidth < 768) setOpen(false);
                  }
                }}
                className={`${menu.margin && "mt-5"} group flex items-center text-sm gap-4 font-bold p-3.5 rounded-2xl transition-all w-full text-left
                  ${isActive 
                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-slate-800"
                  }
                `}
        >
        <div className={`min-w-[24px] flex items-center justify-center ${menu.color}`}>{React.createElement(menu.icon, { size: "22" })}</div>
        <h2 className={`whitespace-pre duration-500 ${!open && "md:opacity-0 md:translate-x-28"} ${isActive ? "text-red-600" : ""}`}>{menu.name}</h2>
      </button>
    );
  })}
</div>

        <div className="pb-5">
           <button onClick={() => setIsLogoutModalOpen(true)} className="flex items-center gap-4 p-3.5 w-full font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all text-left">
             <div className="min-w-[22px]"><HiOutlineLogout size={22} /></div>
             <h2 className={`duration-500 ${!open && "md:opacity-0 md:translate-x-28"}`}>Đăng xuất</h2>
           </button>
        </div>
      </aside>

      {/* ---  MAIN CONTENT  --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        
        {!isDashboardHome && !isPlayingGame && !open && (
          <button className="md:hidden fixed top-5 left-5 z-[45] p-2 bg-white shadow-lg rounded-xl border border-gray-100" onClick={() => setOpen(true)}>
            <HiMenuAlt2 size={24} />
          </button>
        )}

        <header className={`h-20 bg-white shadow-sm items-center justify-between px-6 md:px-10 border-b border-gray-50 shrink-0 ${isDashboardHome ? 'flex' : 'hidden md:flex'}`}>
          <button className="md:hidden p-2 bg-gray-50 rounded-xl" onClick={() => setOpen(true)}>
            <HiMenuAlt2 size={24} />
          </button>
          <div className="hidden md:block"></div>
          <div className="flex items-center gap-4 sm:gap-8">

            <div className="flex items-center gap-2 sm:gap-3">

            {/* Point - 🪙 */}
            <div className="flex items-center bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-100 shadow-sm">
              <span className="text-sm mr-1.5">☀️</span>
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-tighter">
                {user.points}
              </span>
            </div>

            {/* AI Credits - ⚡ */}
            <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-2xl border border-blue-100 shadow-sm relative group cursor-pointer" 
                 onClick={() => setIsShopOpen(true)}>
                <span className="text-sm mr-1.5">⚡</span>
                <span className="text-[11px] font-black text-blue-700 uppercase">
                  {user.availableAIUsage}
                </span>
                <div className="ml-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">
                  +
                </div>
              </div>
            <div className="relative cursor-pointer group" onClick={() => setIsNotiOpen(true)}>
  <HiOutlineBell size={26} className="text-gray-400 group-hover:text-red-500 transition-colors" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 flex h-4 w-4">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] text-white font-black items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </span>
  )}
</div>
            
            {/* Click Profile */}
            <div className="flex items-center gap-4 md:border-l md:pl-8 border-gray-100 cursor-pointer group" onClick={() => setIsProfileOpen(true)}>
              <div className="text-right hidden lg:block">
                <p className="text-sm font-black uppercase text-gray-800 leading-none group-hover:text-red-500 transition-colors">{user.name}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-500 to-pink-500 p-0.5 shadow-lg overflow-hidden group-hover:scale-105 transition-transform">
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover rounded-[14px]" />
              </div>
            </div>
            </div>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto bg-[#f8fafc] ${isDashboardHome ? 'p-4 md:p-10' : 'p-0 md:p-10'}`}>
          <div className={`max-w-7xl mx-auto h-full ${(!isDashboardHome) ? 'pt-16 md:pt-0' : ''}`}>
              <Outlet context={{ isNotiOpen, setIsNotiOpen, fetchUserData, triggerCoinFly }} />
          </div>
        </main>
        {showCoinFly && <CoinFly />}
      </div>
      {isShopOpen && (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsShopOpen(false)} />
    <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-gray-800">HANYU SHOP 🛒</h3>
          <button onClick={() => setIsShopOpen(false)} className="text-gray-400 hover:text-red-500"><HiX size={24}/></button>
        </div>

        <div className="bg-orange-50 p-4 rounded-3xl mb-6 flex items-center justify-between border border-orange-100" >
          <span className="font-bold text-orange-700">Ví điểm của bạn:</span>
          <span className="text-xl font-black text-orange-600">☀️ {user.points}</span>
        </div>

        <div className="space-y-4">
          {/* Gói đổi 1 */}
          <div className="group p-5 bg-white border-2 border-gray-100 rounded-[30px] hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between"
               onClick={() => handleExchange(50, 5)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
              <div>
                <p className="font-black text-gray-800">Gói Tiết Kiệm</p>
                <p className="text-xs text-gray-400 font-bold">+5 lượt hỏi AI</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-100 group-hover:bg-blue-500 group-hover:text-white rounded-2xl font-black text-xs transition-colors">
              50 ☀️
            </button>
          </div>

          {/* Gói đổi 2 */}
          <div className="group p-5 bg-white border-2 border-gray-100 rounded-[30px] hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between"
               onClick={() => handleExchange(150, 20)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl">⚡⚡</div>
              <div>
                <p className="font-black text-gray-800">Gói Học Tập</p>
                <p className="text-xs text-gray-400 font-bold">+20 lượt hỏi AI</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gray-100 group-hover:bg-blue-500 group-hover:text-white rounded-2xl font-black text-xs transition-colors">
              150 ☀️
            </button>
          </div>
        </div>
        
        <p className="text-center text-[10px] text-gray-400 font-bold uppercase mt-6 tracking-widest">
          Học càng nhiều, đổi càng phê!
        </p>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Dashboard;