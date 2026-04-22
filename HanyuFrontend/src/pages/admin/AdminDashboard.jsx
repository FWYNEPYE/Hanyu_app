import React, { useState, useEffect } from 'react'; // THÊM useEffect
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // THÊM axios
import { 
  HiOutlineChartBar, HiOutlineUsers, HiOutlineMap, 
  HiOutlineChatAlt, HiOutlineCog, HiOutlinePuzzle,
  HiOutlineTrendingUp, HiOutlineSearch, HiOutlineBell,
  HiOutlineLogout, HiOutlineViewGrid,
  HiOutlineClipboardList, HiOutlineChatAlt2
} from "react-icons/hi";

// Import các sub-components
import UserManagement from './UserManagement';
import RoadmapManagement from './RoadmapManagement';
import GameManagement from './GameManagement';
import SystemConfig from './SystemConfig';
import RankingManagement from './RankingManagement';
import CommunityManagement from './CommunityManagement';
import ChatManagement from './ChatManagement';
import QuizManagement from './QuizManagement';
import AIChatHistory from './AIChatHistory';
import Analytics from './Analytics';
import DashboardOverview from './DashboardOverview';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, pendingPosts: 0, dangerChatCount: 0 }); // State lưu badge
  const navigate = useNavigate();

  // 1. FETCH DATA THẬT ĐỂ ĐỔ VÀO BADGE SIDEBAR
  useEffect(() => {
    const fetchSidebarStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [adminStats, dangerRes] = await Promise.all([
          axios.get('http://localhost:5252/api/Admin/stats', { headers }),
          axios.get('http://localhost:5252/api/AdminCommunityChat/danger-count', { headers })
        ]);

        setStats({
          totalUsers: adminStats.data.totalUsers,
          pendingPosts: adminStats.data.pendingPosts,
          dangerChatCount: dangerRes.data.count
        });
      } catch (error) {
        console.error("Lỗi lấy dữ liệu sidebar:", error);
      }
    };

    fetchSidebarStats();
    const interval = setInterval(fetchSidebarStats, 30000); // 30s cập nhật badge 1 lần
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview setTab={setActiveTab} />;
      case 'users': return <UserManagement />;
      case 'roadmap': return <RoadmapManagement />;
      case 'games': return <GameManagement />;
      case 'ranking': return <RankingManagement />;
      case 'community': return <CommunityManagement />;
      case 'system': return <SystemConfig />;
      case 'community-chats': return <ChatManagement />;
      case 'quiz': return <QuizManagement />;
      case 'analytics': return <Analytics />;
      case 'ai-chats': return <AIChatHistory />;
      default: return <DashboardOverview setTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0F1A] text-slate-300 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0B0F1A] border-r border-slate-800 flex flex-col p-6 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">HY</div>
          <span className="text-xl font-bold tracking-tight text-white">Hanyu Admin</span>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">Chính</p>
          <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<HiOutlineChartBar />} label="Tổng quan" />
          
          <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2 mt-6">Dữ liệu học tập</p>
          <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<HiOutlineUsers />} label="Người dùng" badge={stats.totalUsers >= 1000 ? `${(stats.totalUsers / 1000).toFixed(1)}k` : stats.totalUsers.toString()} />
          <NavItem active={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} icon={<HiOutlineMap />} label="Lộ trình học" />
          <NavItem active={activeTab === 'games'} onClick={() => setActiveTab('games')} icon={<HiOutlinePuzzle />} label="Nội dung Game" />
          <NavItem active={activeTab === 'ranking'} onClick={() => setActiveTab('ranking')} icon={<HiOutlineTrendingUp />} label="Xếp hạng" />
          
          <NavItem 
            active={activeTab === 'community'} 
            onClick={() => setActiveTab('community')} 
            icon={<HiOutlineChatAlt2 />} 
            label="Cộng đồng Hanyu" 
           badge={stats.pendingPosts > 0 ? stats.pendingPosts.toString() : null}
          />
          
          <NavItem active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<HiOutlineClipboardList />} label="Câu đố & Thử thách" />
          
          {/* Badge cho tin nhắn nguy hiểm/spam */}
          <NavItem 
            active={activeTab === 'community-chats'} 
            onClick={() => setActiveTab('community-chats')} 
            icon={<HiOutlineChatAlt />} 
            label="Chat Cộng đồng" 
            badge={stats.dangerChatCount > 0 ? stats.dangerChatCount.toString() : null}
            isDanger={stats.dangerChatCount > 0}
          />

          <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2 mt-6">Hệ thống & AI</p>
          <NavItem active={activeTab === 'ai-chats'} onClick={() => setActiveTab('ai-chats')} icon={<HiOutlineChatAlt />} label="Lịch sử Chat AI" />
          <NavItem active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<HiOutlineClipboardList />} label="Thống kê & Báo cáo" />
          <NavItem active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<HiOutlineCog />} label="Cấu hình hệ thống" />
        </nav>

        <button onClick={handleLogout} className="mt-10 flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-500 transition-all rounded-xl hover:bg-rose-500/5">
          <HiOutlineLogout /> <span className="text-sm font-bold">Đăng xuất</span>
        </button>
      </aside>

      {/* MAIN CONTENT (Giữ nguyên phần Header và RenderContent của sếp) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-800/50 bg-[#0B0F1A]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center bg-[#161B26] px-4 py-2.5 rounded-xl w-96 border border-slate-700/30">
            <HiOutlineSearch className="text-slate-500" />
            <input type="text" placeholder="Tìm kiếm nhanh..." className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-slate-200" />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative p-2 text-slate-400 hover:text-white cursor-pointer bg-[#161B26] rounded-lg border border-slate-700/50">
              <HiOutlineBell size={20} />
              {(stats.pendingPosts > 0 || stats.dangerChatCount > 0) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0B0F1A]"></span>
              )}
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
              <div className="text-right">
                <p className="text-sm font-bold text-white leading-none">Admin</p>
              </div>
              <img src="https://api.dicebear.com/8.x/bottts/svg?seed=Admin" className="w-10 h-10 rounded-xl border border-slate-700 bg-[#161B26]" alt="avatar" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">
                <span>Admin</span>
                <span>/</span>
                <span className="text-blue-500">{activeTab}</span>
            </div>
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Cập nhật NavItem để hỗ trợ Badge màu đỏ khi có nguy hiểm
const NavItem = ({ icon, label, active, onClick, badge, isDanger }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
      ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent'
    }`}
  >
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    <span className={`text-sm font-bold tracking-tight ${active ? 'text-blue-400' : ''}`}>{label}</span>
    {badge && (
      <span className={`ml-auto text-[9px] py-0.5 px-1.5 rounded-md font-black border ${
        isDanger 
        ? 'bg-rose-500/20 text-rose-500 border-rose-500/30 animate-pulse' 
        : 'bg-slate-800 text-slate-400 border-slate-700'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

export default AdminDashboard;