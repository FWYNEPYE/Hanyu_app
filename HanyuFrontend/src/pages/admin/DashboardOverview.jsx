import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HiOutlineLightningBolt, HiOutlineUserGroup, HiOutlineChatAlt2, 
  HiOutlineShieldExclamation, HiOutlineArrowSmUp, HiOutlineCalendar,
  HiOutlineVideoCamera, HiOutlineBookOpen
} from "react-icons/hi";
import { useNavigate } from 'react-router-dom';

const DashboardOverview = ({setTab}) => {
  const navigate = useNavigate();

  
  const [stats, setStats] = useState({ totalUsers: 0, totalRoadmaps: 0, totalVideos: 0, totalVocabs: 0, pendingPosts: 0, unreadNotifications: 0 });
  const [health, setHealth] = useState({ cpu: 0, ram: 0, dbStatus: 'Connecting...' });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

// DashboardOverview.jsx

useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, healthRes, activityRes, dangerRes] = await Promise.all([
        axios.get('/api/Admin/stats', { headers }),
        axios.get('/api/Admin/server-health', { headers }),
        axios.get('/api/Admin/recent-activities', { headers }),
        axios.get('/api/AdminCommunityChat/danger-count', { headers })
      ]);

      setStats({
        ...statsRes.data,
        dangerChatCount: dangerRes.data.count 
      });
      setHealth(healthRes.data);
      setActivities(activityRes.data);
    } catch (error) {
      console.error("Lỗi fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
}, []);

  if (loading) return <div className="p-8 text-white italic">Đợi xíu...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-blue-600/10 to-transparent p-8 rounded-3xl border border-blue-500/10 text-white">
        <div>
          <h1 className="text-2xl font-black ">Xin chào!!!</h1>
        </div>
        <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-end gap-2">
                <HiOutlineCalendar /> {new Date().toLocaleDateString('vi-VN')}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Học viên" value={stats.totalUsers} icon={<HiOutlineUserGroup />} color="text-blue-500" />
        <StatCard title="Lộ trình" value={stats.totalRoadmaps} icon={<HiOutlineBookOpen />} color="text-purple-500" />
        <StatCard title="Video" value={stats.totalVideos} icon={<HiOutlineVideoCamera />} color="text-yellow-500" />
        <StatCard title="Từ vựng" value={stats.totalVocabs} icon={<HiOutlineLightningBolt />} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <AlertCard 
                icon={<HiOutlineChatAlt2 className="text-blue-500" />} 
                title="Duyệt nội dung" 
                desc={stats.pendingPosts > 0 
                    ? `Có ${stats.pendingPosts} bài viết mới đang chờ duyệt.` 
                    : "Không có bài viết nào chờ duyệt."}
                action="Duyệt bài"
                color={stats.pendingPosts > 0 ? "border-blue-500/50 bg-blue-500/5" : "border-slate-800"}
                onClick={() => setTab('community')}
            />

          
           <AlertCard 
                icon={<HiOutlineShieldExclamation className="text-rose-500" />} 
                title="An ninh hệ thống" 
                desc={stats.dangerChatCount > 0 
                    ? `Phát hiện ${stats.dangerChatCount} tin nhắn bẩn.` 
                    : "Hệ thống chat không có vi phạm."} 
                action="Xử lý ngay" 
                color={stats.dangerChatCount > 0 ? "border-rose-500/50 bg-rose-500/5" : "border-slate-800"} 
                onClick={() => setTab('community-chats')} 
            />
            
            
          </div>

          <div className="bg-[#161B26] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <HiOutlineLightningBolt className="text-yellow-500" /> Nhật ký học tập 
              </h3>
              <div className="space-y-4 text-white">
                  {activities.map((act, i) => (
                      <div key={i} className="flex justify-between text-xs border-b border-slate-800/50 pb-3">
                          <span><b className="text-blue-400">{act.user}</b> {act.action} <b className="text-yellow-500">{act.target}</b></span>
                          {/* <span className="text-slate-500 italic">{new Date(act.time).toLocaleTimeString()}</span> */}
                      </div>
                  ))}
              </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#161B26] border border-slate-800 rounded-3xl p-6 space-y-8 shadow-2xl">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest">Tài nguyên Server</h3>
            
            <ResourceBar label="CPU Usage" value={health.cpu} color="bg-blue-500" />
            <ResourceBar label="Memory" value={health.ram} color="bg-purple-500" />

            <div>
                <div className="flex justify-between text-[10px] font-bold mb-2 uppercase text-slate-500">
                    <span>SQL Server</span>
                    <span className={health.dbStatus === 'Connected' ? "text-green-500" : "text-red-500"}>{health.dbStatus}</span>
                </div>
                <div className="flex gap-1 h-8 items-end">
                    {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="flex-1 bg-green-500/20 rounded-t-sm h-full animate-pulse"></div>)}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-[#161B26] border border-slate-800 p-6 rounded-3xl">
        <div className={`text-2xl ${color} mb-4`}>{icon}</div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-white mt-1">{value.toLocaleString()}</p>
    </div>
);

const ResourceBar = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between text-[10px] font-bold mb-2 uppercase text-slate-500">
            <span>{label}</span><span className="text-white">{value}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div style={{ width: `${value}%` }} className={`h-full ${color} transition-all duration-1000 shadow-lg`}></div>
        </div>
    </div>
);

const AlertCard = ({ icon, title, desc, action, color, onClick }) => (
    <div className={`bg-[#161B26] border ${color} p-4 rounded-2xl flex justify-between items-center text-white`}>
        <div className="flex gap-3">
            <div className="p-2 bg-[#0B0F1A] rounded-lg">{icon}</div>
            <div>
                <p className="text-xs font-bold">{title}</p>
                <p className="text-[10px] text-slate-500 mt-1">{desc}</p>
            </div>
        </div>
        <button 
            onClick={onClick}
            className="text-[9px] font-black text-blue-500 uppercase px-2 py-1 bg-blue-500/5 rounded border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
        >
            {action}
        </button>
    </div>
);

export default DashboardOverview;