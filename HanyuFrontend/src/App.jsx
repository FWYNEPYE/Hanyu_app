import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import AdminDashboard from './pages/admin/AdminDashboard';
import axios from "axios";


// Import các trang
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import AIChat from './pages/AIChat'; 
import Vocabulary from './pages/Vocabulary';
import Game from './pages/Game';
import LeaderboardPage from './pages/LeaderboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import VideoLearning from './pages/VideoLearning';
import RoadmapDetail from './components/RoadmapDetail';
import CommunityCard from './pages/CommunityCard';
import StepDetail from './components/StepDetail';
import FinalTestSession from './components/FinalTestSession';
import SRSGame from './components/SRSGame';
import ExamConfig from "./components/admin/ExamConfig";
import GameManagement from './pages/admin/GameManagement';
import ChatManagement from './pages/admin/ChatManagement';


const MaintenancePage = () => (
  <div className="h-screen w-full bg-[#0B0F1A] flex flex-col items-center justify-center text-white text-center p-6">
    <h1 className="text-5xl mb-4">🛠️</h1>
    <h2 className="text-3xl font-bold text-rose-500 mb-2">Hệ thống đang bảo trì</h2>
    <p className="text-slate-400">Anh đang nâng cấp AI cho xịn hơn tí, em quay lại sau nhé!</p>
  </div>
);


function AppContent() {
  const navigate = useNavigate(); 
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isChecking, setIsChecking] = useState(true);


  // --- hàm quan sát ---
useEffect(() => {
  const checkConfig = async () => {
    try {
      console.log("Đang check cấu hình hệ thống...");
      const res = await axios.get('http://localhost:5252/api/AdminConfigs');
      
      // Kiểm tra kỹ giá trị trả về
      if (res.data && String(res.data.MaintenanceMode).toLowerCase() === 'true') {
        setIsMaintenance(true);
      } else {
        setIsMaintenance(false);
      }
    } catch (err) {
      console.error("Lỗi kết nối Backend:", err);
      setIsMaintenance(false); 
    } finally {
      setIsChecking(false); 
    }
  };

  checkConfig();
}, []);


useEffect(() => {
  setIsAuthenticated(!!localStorage.getItem('token'));
  
  if (location.pathname.includes('vocabulary')) {
    window.dispatchEvent(new CustomEvent('lili-context', { detail: { page: 'vocabulary' } }));
  }
}, [location]);



   const isAdminPage = location.pathname.includes('/admin-portal');
  

  if (isChecking) return <div className="bg-[#0B0F1A] h-screen flex items-center justify-center text-white">Đang khởi động...</div>;

  if (isMaintenance && !isAdminPage) {
    return <MaintenancePage />;
  }

  // --- BỘ LỌC HIỂN THỊ AI CHAT ---
  const isLoginPage = location.pathname === '/login';
  const isHomePage = location.pathname === '/';
  const isGamePage = location.pathname.includes('/game');
  const isFinalTestPage = location.pathname.includes('/final-test');
 

  const shouldShowAI = isAuthenticated && !isLoginPage && !isHomePage && !isGamePage && !isFinalTestPage && !isAdminPage;

  return (
    <>
      {shouldShowAI && <AIChat currentPage={location.pathname} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="vocabulary" element={<Vocabulary />} />
            <Route path="game" element={<Game />} />
          
            <Route path="game/srs" element={<SRSGame onBack={() => navigate('/dashboard/game')} />} />

            <Route path="video" element={<VideoLearning />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="roadmap/:id" element={<RoadmapDetail />} />
            <Route path="communitycard" element={<CommunityCard />} />
            <Route path="roadmap-step/:stepId" element={<StepDetail />} />
            <Route path="final-test/:stepId" element={<FinalTestSession />} />  

          </Route>
        </Route>
        
        {/* admin */}
        <Route element={<ProtectedRoute allowRoles={['Admin']} />}>
          <Route path="/admin-portal" element={<AdminDashboard />} />
          <Route path="/admin-portal/game-management" element={<GameManagement />} />
          <Route path="/admin-portal/exam-config/:stepId" element={<ExamConfig />} />
          <Route path="/admin-portal/chat" element={<ChatManagement />} />
        </Route>

      
      <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;