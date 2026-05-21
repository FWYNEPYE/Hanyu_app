import React, { useState, useEffect } from 'react';
import { HiOutlineUser, HiOutlineVideoCamera, HiOutlineShieldCheck, HiOutlineArrowLeft, HiOutlineCheck, HiOutlineTrash, HiOutlineExternalLink } from "react-icons/hi";
import axios from 'axios';

const VideoModeration = () => {
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    // Lưu ý: Kiểm tra port 5252 đã chạy chưa
    axios.get('http://localhost:5252/api/AdminVideo/users-active')
      .then(res => setUsers(res.data))
      .catch(err => console.error("Lỗi API Users:", err));
  }, []);

  const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSelectUser = async (user) => {
    // Sửa u.userID thành u.userId nếu API trả về camelCase
    setActiveUser(user);
    setSelectedVideo(null);
    try {
      const res = await axios.get(`http://localhost:5252/api/AdminVideo/user-videos/${user.userId || user.userID}`);
      setVideos(res.data);
    } catch (err) {
      console.error("Lỗi API Videos:", err);
    }
  };

  const handleViewDetail = async (videoId) => {
    try {
      const res = await axios.get(`http://localhost:5252/api/AdminVideo/video-detail/${videoId}`);
      setSelectedVideo(res.data);
    } catch (err) {
      console.error("Lỗi API Detail:", err);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)] p-4 bg-[#0D1117] text-slate-300">
      
      {/* CỘT 1: DANH SÁCH HỌC VIÊN */}
      <div className="w-1/4 bg-[#161B26] border border-slate-800 rounded-[2rem] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-widest">Danh sách đóng góp</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {users.map(u => (
            <button 
              key={u.userId || u.userID} 
              onClick={() => handleSelectUser(u)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeUser?.userId === u.userId ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
            >
              <HiOutlineUser size={20} />
              <span className="font-bold text-sm truncate">{u.username}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CỘT 2: CHI TIẾT & VIDEO */}
      <div className="flex-1 bg-[#161B26] border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden relative shadow-2xl">
        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic text-sm">
            Chọn một học viên để xem danh sách video
          </div>
        ) : !selectedVideo ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-800">
              <h2 className="text-white font-black text-xl uppercase italic tracking-tight">{activeUser.username}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-4 bg-[#0D1117]">
              {videos.map(v => (
                <div key={v.id} onClick={() => handleViewDetail(v.id)} className="cursor-pointer bg-[#161B26] border border-slate-800 p-5 rounded-3xl hover:border-blue-500 transition-all group">
                  <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg w-fit mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <HiOutlineVideoCamera size={24}/>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1 truncate">{v.title}</h4>
                  <p className="text-[10px] text-slate-500 font-mono italic">{v.time}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-[#1E2533]/50 flex justify-between items-center">
              <button onClick={() => setSelectedVideo(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase">
                <HiOutlineArrowLeft /> Quay lại
              </button>
              <div className="flex gap-2">
                <button className="bg-emerald-500/20 text-emerald-500 p-2 rounded-xl hover:bg-emerald-500 transition-all"><HiOutlineCheck size={20}/></button>
                <button className="bg-red-500/20 text-red-500 p-2 rounded-xl hover:bg-red-500 transition-all"><HiOutlineTrash size={20}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-[#0D1117] space-y-8">
              {/* VIDEO PLAYER */}
              <div className="aspect-video w-full bg-black rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
                {/* Dùng youtubeUrl hoặc urlOrPath tùy theo API trả về */}
                {getYouTubeID(selectedVideo.youtubeUrl || selectedVideo.urlOrPath) ? (
                  <iframe 
                    width="100%" height="100%" 
                    src={`https://www.youtube.com/embed/${getYouTubeID(selectedVideo.youtubeUrl || selectedVideo.urlOrPath)}`} 
                    title="Video Player" frameBorder="0" 
                    allowFullScreen>
                  </iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-red-500 text-xs italic p-10 text-center">
                    <HiOutlineExternalLink className="mr-2" size={20}/> URL Video không hợp lệ (Cần link YouTube)
                  </div>
                )}
              </div>

              {/* AI REPORT */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#161B26] border border-slate-800 p-6 rounded-[2rem]">
                  <h5 className="text-slate-500 font-black uppercase text-[10px] mb-4 flex items-center gap-2">
                    <HiOutlineShieldCheck className="text-emerald-500"/> AI Scan Score
                  </h5>
                  <p className={`text-4xl font-black ${selectedVideo.aiAnalysis?.nsfwScore > 40 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {selectedVideo.aiAnalysis?.nsfwScore || 0}%
                  </p>
                </div>
                <div className="bg-[#161B26] border border-slate-800 p-6 rounded-[2rem]">
                   <h5 className="text-slate-500 font-black uppercase text-[10px] mb-2 italic">Nội dung tóm lược</h5>
                   <p className="text-sm text-slate-300 italic">"{selectedVideo.aiAnalysis?.transcriptionSummary || "Đang phân tích..."}"</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModeration;