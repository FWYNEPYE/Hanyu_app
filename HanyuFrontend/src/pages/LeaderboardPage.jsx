import React from 'react';
import Leaderboard from '../components/Leaderboard';
import ActivityTracker from '../components/ActivityTracker';
import SentencePuzzle from '../components/SentencePuzzle';
import CommunityChat from '../components/CommunityChat';

const LeaderboardPage = () => {
  const users = [
    { id: 1, name: "Hehe", score: 26, isMe: false },
    { id: 2, name: "Hihi", score: 25, isMe: false },
    { id: 3, name: "Huhu", score: 25, isMe: false },
    { id: 4, name: "Haha", score: 22, isMe: false },
    { id: 5, name: "Hê ê", score: 19, isMe: true },
    { id: 6, name: "Hoho", score: 15, isMe: false },
    { id: 7, name: "Hịhị", score: 12, isMe: false },
    { id: 8, name: "Fan anh Jack", score: 10, isMe: false },
  ];

  return (
    <div className="bg-white min-h-screen p-4 md:p-8 font-sans transition-all">
     
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        
        {/* --- CỘT BẢNG XẾP HẠNG --- */}
        {/* Để order-1 để trên Mobile nó hiện lên đầu tiên */}
        <div className="flex flex-col gap-6 order-1 lg:order-1">
          <h2 className="text-2xl font-black text-orange-600 uppercase  flex items-center gap-3">
            <span className="p-3 bg-orange-100 rounded-2xl shadow-sm">🏆</span> 
            Bảng Xếp Hạng
          </h2>
          <Leaderboard data={users} />
        </div>

        {/* --- CỘT TIỆN ÍCH  --- */}
        {/*  order-2 là để trên Mobile nó nằm phía dưới Bảng xếp hạng */}
        <div className="flex flex-col gap-8 order-2 lg:order-2">
          {/* 1. Tần suất */}
          <div>
            <h3 className="text-sm font-black text-orange-500 mb-4 uppercase tracking-widest ">Tiến độ học tập</h3>
            <ActivityTracker />
          </div>

          {/* 2. Giải đố (Sắp xếp câu) */}
          <SentencePuzzle />

          {/* 3. Trò chuyện cộng đồng */}
          <CommunityChat />
        </div>

      </div>
    </div>
  );
};

export default LeaderboardPage;