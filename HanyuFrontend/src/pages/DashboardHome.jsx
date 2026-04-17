import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  HiOutlineFire, HiOutlineTrendingUp, HiOutlineLightningBolt, 
  HiOutlineBadgeCheck, HiOutlineUserGroup, HiOutlineArrowRight, 
  HiPlus, HiOutlineBell, HiOutlineClipboardList, HiOutlineClock, 
  HiOutlineBookOpen, HiOutlineTranslate, HiOutlineAcademicCap, HiOutlineFlag,
  HiOutlineExclamationCircle
} from "react-icons/hi";
import { PiMedalLight } from 'react-icons/pi';
import { Link, useOutletContext } from 'react-router-dom';

const DashboardHome = () => {
  // --- STATE DỮ LIỆU TỪ BACKEND ---
  const [loading, setLoading] = useState(true);
  const [backendData, setBackendData] = useState(null);
  const { fetchUserData, triggerCoinFly } = useOutletContext();

  // 1. Logic Đếm thời gian học (Giữ nguyên logic gốc)
  const [seconds, setSeconds] = useState(0); 
  
  const [isRewarded, setIsRewarded] = useState(false);
  
  const secondsRef = useRef(0);
  useEffect(() => { secondsRef.current = seconds; }, [seconds]);


  // Lấy dữ liệu từ Backend khi load trang
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token'); // Lấy token người dùng đăng nhập
        const response = await axios.get('http://localhost:5252/api/Dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBackendData(response.data);
        
        // Lấy thời gian học của ngày hôm nay từ ActivityChart (nếu có)
        const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '/');
        const todayProgress = response.data.activityChart.find(x => x.date === todayStr);
        if (todayProgress) {
          setSeconds(todayProgress.seconds);
          if (todayProgress.isCompleted || todayProgress.seconds >= 600) {
             setIsRewarded(true);
          }
        }
        
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



const handleAutoClaim = async () => {
  try {
    setIsRewarded(true);
    triggerCoinFly();

    const token = localStorage.getItem("token");
    // 1. Cộng điểm
    await axios.post("http://localhost:5252/api/User/add-points", 
      { pointsToAdd: 10 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await saveProgressToBackend(600);

    // 3. Cập nhật UI
    setTimeout(async () => {
      fetchUserData(); 
      
      const response = await axios.get('http://localhost:5252/api/Dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackendData(response.data); 
      
      console.log("🔥 Dashboard đã cập nhật trạng thái mới!");
    }, 1200);

  } catch (err) {
    console.error("Lỗi tự động cộng điểm:", err);
    setIsRewarded(false);
  }
};




useEffect(() => {
    if (seconds === 600 && !isRewarded) handleAutoClaim();
    if (seconds > 0 && seconds % 30 === 0) saveProgressToBackend(seconds);
  }, [seconds]);



// Logic xử lý khi User đóng tab hoặc F5 đột ngột
useEffect(() => {
    const handleBeforeUnload = () => {
      const token = localStorage.getItem('token');
      fetch('http://localhost:5252/api/Dashboard/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ seconds: secondsRef.current }), // Dùng Ref ở đây
        keepalive: true
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);





// Timer đếm giây và tự động xử lý Streak/Point

useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);



//điểm bay

  const handleClaimReward = async () => {
    try {
      // 1. Kích hoạt hiệu ứng bay ngay lập tức cho sướng mắt
      triggerCoinFly();

      // 2. Gọi API cộng điểm (mày đã viết hàm handleAddPoints ở Cha nhưng chưa truyền xuống)
      // Ở đây tao ví dụ gọi trực tiếp hoặc dùng hàm từ context nếu mày truyền nó xuống
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5252/api/User/add-points", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ pointsToAdd: 10 })
      });

      // 3. Đợi xu bay gần tới nơi thì cập nhật số thực trên Header
      setTimeout(() => {
        fetchUserData();
      }, 1200);

    } catch (err) {
      console.error("Lỗi nhận thưởng:", err);
    }
  };


  //lưu thời gian
const saveProgressToBackend = async (currentSeconds) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post('http://localhost:5252/api/Dashboard/update-progress', 
      { seconds: currentSeconds },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Nếu backend trả về streak mới, cập nhật vào state luôn cho nóng
    if (res.data.success && res.data.currentStreak !== undefined) {
      setBackendData(prev => ({
        ...prev,
        userStats: { ...prev.userStats, currentStreak: res.data.currentStreak }
      }));
    }
    console.log("✅ Đã lưu tiến độ:", currentSeconds);
  } catch (error) {
    console.error("Lỗi sync streak:", error);
  }
};





  // Hàm format thời gian 
  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
  };

  const studyMinutes = Math.floor(seconds / 60);
const isGoalReached = seconds >= 600;

  const streakHistory = useMemo(() => {
    return backendData?.activityChart.map(item => {
      const [day, month] = item.date.split('/');
      const dateObj = new Date(new Date().getFullYear(), month - 1, day);
      const label = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dateObj.getDay()];
      return {
        label,
        active: item.isCompleted || (item.date === new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) && isGoalReached)
      };
    }) || [];
  }, [backendData, isGoalReached]);


const stats = useMemo(() => [
    { id: 'task', label: "Nhiệm vụ hôm nay", value: "HSK 1: Động từ", sub: "Còn 5 từ", icon: HiOutlineClipboardList, color: "text-blue-500", bg: "bg-blue-50", link: "/dashboard/vocabulary", isLink: true },
    { id: 'review', label: "Từ đến hạn ôn tập", value: "12 từ", sub: "Nhắc lại ngay", icon: HiOutlineBell, color: "text-red-500", bg: "bg-red-50", link: "/dashboard/review", isLink: true },
    { id: 'progress', label: "Tiến độ hiện tại", value: "65%", sub: `Tổng: ${backendData?.totalVocabulary || 0} từ`, icon: HiOutlineTrendingUp, color: "text-green-500", bg: "bg-green-50", isLink: false },
    { 
      id: 'performance', 
      label: "Thời gian học", 
      value: formatTime(seconds), 
      sub: isGoalReached ? "🔥 GIỮ CHUỖI THÀNH CÔNG" : `Cần thêm ${Math.ceil(10 - seconds/60)} phút`, 
      icon: isGoalReached ? HiOutlineBadgeCheck : HiOutlineClock,
      color: isGoalReached ? "text-emerald-500" : "text-red-500", 
      bg: isGoalReached ? "bg-emerald-50" : "bg-red-50",
      isLink: false,
      isWarning: !isGoalReached
    },
  ], [seconds, backendData, isGoalReached]);

  const learningRoadmaps = useMemo(() => [
    { title: "HSK", desc: "Chứng chỉ năng lực Hán Ngữ (6 cấp)", icon: HiOutlineFlag, color: "text-red-500", bg: "bg-red-50", progress: 40, status: "Đang học" },
    { title: "TOCFL", desc: "Kỳ thi năng lực Hoa Ngữ", icon: HiOutlineBadgeCheck, color: "text-blue-500", bg: "bg-blue-50", progress: 0, status: "Chưa bắt đầu" },
    { title: "Giao tiếp thực tế", desc: "Tiếng Trung đời sống & Phản xạ", icon: HiOutlineTranslate, color: "text-orange-500", bg: "bg-orange-50", progress: 85, status: "Gần hoàn thành" },
    { title: "Học tập Học thuật", desc: "Bộ thủ, cấu trúc câu & viết", icon: HiOutlineAcademicCap, color: "text-purple-500", bg: "bg-purple-50", progress: 10, status: "Mới bắt đầu" },
  ], [backendData]);

  if (loading) return <div className="p-10 text-center font-black animate-pulse">ĐANG TẢI DỮ LIỆU...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16 px-4 md:px-0 font-sans">
      
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-[1.8] bg-gradient-to-br from-red-600 to-pink-600 rounded-[35px] p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-red-100/50 flex flex-col justify-center">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black mb-2 uppercase tracking-tighter ">CHÀO MỪNG, {backendData?.userStats.username || "NGƯỜI HỌC"}! 👋</h1>
            <p className="text-red-50 font-bold text-xs md:text-sm max-w-sm opacity-90 leading-relaxed">Mục tiêu hôm nay là 30 từ mới. Cố gắng lên nhé!</p>
            <Link to="/dashboard/vocabulary">
              <button className="mt-4 bg-white text-red-600 px-6 py-2 rounded-xl font-black hover:shadow-lg transition-all active:scale-95 text-[9px] uppercase tracking-widest">Tiếp tục bài học</button>
            </Link>
          </div>
          <div className="absolute top-[-20%] right-[-5%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className={`flex-1 rounded-[35px] p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[180px] transition-colors duration-500 ${isGoalReached ? 'bg-[#FF8A00]' : 'bg-gray-800'}`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 p-1.5 rounded-lg"><HiOutlineFire size={20} /></div>
            <span className="font-black uppercase tracking-widest text-[10px]">Chuỗi ngày học</span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-4">
            <span className="text-4xl font-black "> {backendData?.userStats.currentStreak || 0}</span>
            <span className="text-sm font-bold opacity-90 uppercase text-white">Ngày</span>
          </div>
          {!isGoalReached && (
            <div className="absolute top-4 right-4 animate-pulse flex items-center gap-1 bg-red-500 px-2 py-1 rounded-full">
                <HiOutlineExclamationCircle size={12}/>
                <span className="text-[8px] font-bold uppercase">Cần học 10p!</span>
            </div>
          )}
          <div className="flex justify-between items-end bg-black/10 p-3 rounded-[20px] backdrop-blur-sm">
            {streakHistory.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${day.active ? 'bg-white' : 'bg-white/10'}`}>
                  {day.active ? <HiOutlineFire className="text-[#FF8A00]" size={14} /> : <div className="w-1 h-1 rounded-full bg-white/20" />}
                </div>
                <span className={`text-[8px] font-black ${day.active ? 'text-white' : 'text-white/40'}`}>{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item) => {
          const Content = (
            <div className="flex items-center gap-5 min-w-0">
              <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-[22px] flex items-center justify-center shrink-0 shadow-sm transition-all ${item.isWarning && 'animate-pulse'}`}>
                <item.icon className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest break-words leading-tight">{item.label}</p>
                <h4 className={`text-base font-black leading-tight mt-0.5 break-words uppercase tracking-tighter ${item.id === 'performance' ? 'font-mono' : ''} ${item.isWarning ? 'text-red-600' : 'text-gray-800'}`}>
                    {item.value}
                </h4>
                {item.id === 'progress' ? (
                  <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden border border-gray-50">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: item.value }}></div>
                  </div>
                ) : ( 
                    <p className={`text-[10px] font-bold truncate uppercase tracking-tighter mt-1 ${item.isWarning ? 'text-red-500' : 'text-gray-400'}`}>
                        {item.sub}
                    </p> 
                )}
              </div>
            </div>
          );
          return item.isLink ? (
            <Link key={item.id} to={item.link} className="group bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-center">{Content}</Link>
          ) : ( <div key={item.id} className={`bg-white p-6 rounded-[35px] border shadow-sm flex flex-col justify-center min-h-[110px] transition-colors ${item.isWarning ? 'border-red-100' : 'border-gray-100'}`}>{Content}</div> );
        })}
      </div>

      <div className="space-y-4">
        <h3 className="text-center text-xs font-black uppercase tracking-[0.5em] text-gray-300">TRUY CẬP NHANH</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Thêm từ mới", sub: "Tạo từ vựng cá nhân", icon: HiPlus, color: "text-blue-500", bg: "bg-blue-50", link: "/dashboard/vocabulary", state: { openAddTab: true } },
            { label: "Luyện tập", sub: "GAME & FLASHCARD", icon: HiOutlineLightningBolt, color: "text-purple-500", bg: "bg-purple-50", link: "/dashboard/game" },
            { label: "Xếp hạng", sub: "XEM THỨ HẠNG", icon: PiMedalLight, color: "text-orange-500", bg: "bg-orange-50", link: "/dashboard/leaderboard" },
            { label: "Cộng đồng Hanyu", sub: "Chia sẻ bộ từ", icon: HiOutlineUserGroup, color: "text-green-500", bg: "bg-green-50", link: "/dashboard/communitycard" },
          ].map((btn, i) => (
            <Link key={i} to={btn.link} state={btn.state} className="group bg-white p-4 sm:p-6 rounded-[25px] border border-gray-50 shadow-sm hover:shadow-lg transition-all flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 ${btn.bg} ${btn.color} rounded-lg flex items-center justify-center shadow-inner`}><btn.icon size={24} /></div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm">{btn.label}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{btn.sub}</p>
                </div>
              </div>
              <HiOutlineArrowRight className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={14} />
            </Link>
          ))}
        </div>
      </div>

     <div className="space-y-4 pt-4">
  <h3 className="text-center text-xs font-black uppercase tracking-[0.5em] text-gray-300">LỘ TRÌNH</h3>
  <div className="grid grid-cols-1 gap-4">
    {learningRoadmaps.map((roadmap, i) => (
      /* Thêm Link ở đây, chuyển ID hoặc slug qua URL */
      <Link 
        key={i} 
       to={`/dashboard/roadmap/${roadmap.title.toLowerCase().replace(/\s+/g, '-')}`}
        className="group relative bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm hover:border-red-100 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex items-center gap-5"
      >
        <div className={`w-12 h-12 ${roadmap.bg} ${roadmap.color} rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105 duration-500`}>
          <roadmap.icon size={22} />
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 items-center gap-x-6 gap-y-1.5">
          <div className="space-y-1">
            <h4 className="text-sm md:text-base font-black text-gray-800 uppercase tracking-tight leading-tight truncate">{roadmap.title}</h4>
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed truncate">{roadmap.desc}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">
              <span>Hoàn thành</span>
              <span className="text-gray-800 italic">{roadmap.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
              <div className={`h-full rounded-full transition-all duration-1000 ${roadmap.color.replace('text', 'bg')}`} style={{ width: `${roadmap.progress}%` }}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className={`text-[8px] md:text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-inner ${roadmap.status === "Đang học" ? "bg-green-500 text-white animate-pulse" : "bg-gray-100 text-gray-400"}`}>
            {roadmap.status}
          </span>
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center group-hover:bg-red-600 transition-all shadow-md group-hover:translate-x-1">
            <HiOutlineArrowRight size={16} />
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>
    </div>
  );
};

export default DashboardHome;