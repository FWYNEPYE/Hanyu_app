import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Import các trang của mày
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
function AppContent() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // --- hàm quan sát ---
  useEffect(() => {
    //  Cập nhật trạng thái đăng nhập
    setIsAuthenticated(!!localStorage.getItem('token'));

    //  Gửi context sang cho AI 
    const currentPath = location.pathname;
    
    if (currentPath.includes('vocabulary')) {
      console.log("Lili: fen này đang học từ vựng, để tao chuẩn bị khảo bài...");
      // Mày có thể dùng window.dispatchEvent để bắn tin hiệu cho AIChat nếu cần
      const event = new CustomEvent('lili-context', { detail: { page: 'vocabulary' } });
      window.dispatchEvent(event);
    }
    
    if (currentPath.includes('video')) {
      console.log("Lili: Chủ nhân đang xem video, chuẩn bị giải thích ngữ pháp video...");
    }

  }, [location]);

  // --- BỘ LỌC HIỂN THỊ AI CHAT ---
  const isLoginPage = location.pathname === '/login';
  const isHomePage = location.pathname === '/';
  const isGamePage = location.pathname.includes('/game');

  const shouldShowAI = isAuthenticated && !isLoginPage && !isHomePage && !isGamePage;

  return (
    <>
      {shouldShowAI && <AIChat currentPage={location.pathname} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<DashboardHome />} />

            <Route path="search" element={<SearchPage />} />

            <Route path="vocabulary" element={<Vocabulary />} />

            <Route path="game" element={<Game />} />

            <Route path="video" element={<VideoLearning />} />

            <Route path="leaderboard" element={<LeaderboardPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<Navigate to="/login" />} />
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