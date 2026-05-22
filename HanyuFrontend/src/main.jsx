import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios'; // 1. Thêm import này

// 2. Thêm đoạn "cảnh sát giao thông" này ngay dưới các dòng import
axios.interceptors.request.use((config) => {
  if (config.url && config.url.includes('http://localhost:5252')) {
    // Tự động thay thế localhost bằng link Railway thật
    config.url = config.url.replace('http://localhost:5252', 'https://hanyuapp-production.up.railway.app');
  }
  return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="458626277443-5tadct3nv33bl5214g7n9uosp519vjq3.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)