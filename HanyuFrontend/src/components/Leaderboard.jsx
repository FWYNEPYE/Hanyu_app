import React, { useState } from 'react';

const Leaderboard = ({ data, currentUserId }) => {
  
  const [tab, setTab] = useState('points'); 

  const sortedData = [...data].sort((a, b) => {
    return tab === 'points' ? b.score - a.score : b.streak - a.streak;
  });

  return (
    <div className="w-full bg-white rounded-[30px] border-2 border-orange-100 overflow-hidden shadow-sm">
      {/* HEADER TABS */}
      <div className="flex p-2 bg-orange-50 border-b-2 border-orange-100">
        <button 
          onClick={() => setTab('points')}
          className={`flex-1 py-3 rounded-2xl font-black text-base transition-all ${
            tab === 'points' 
            ? 'bg-orange-500 text-white shadow-[0_4px_0_#c2410c]' 
            : 'text-orange-600 hover:bg-orange-100'
          }`}
        >
          🌱 Hoạt động 
        </button>
        <button 
          onClick={() => setTab('streak')}
          className={`flex-1 py-3 rounded-2xl font-black text-base transition-all ${
            tab === 'streak' 
            ? 'bg-orange-500 text-white shadow-[0_4px_0_#c2410c]' 
            : 'text-orange-600 hover:bg-orange-100'
          }`}
        >
          Streak 🔥
        </button>
      </div>

      <div className="max-h-[500px] overflow-y-auto no-scrollbar">
        {sortedData.map((user, i) => {
          const isMe = Number(user.id) === Number(currentUserId);

          return (
            <div 
              key={user.id} 
              className={`grid grid-cols-[50px_1fr_80px] items-center px-6 py-4 border-b border-orange-50 ${isMe ? 'bg-orange-100' : 'hover:bg-gray-50/50'}`}
            >
              {/* Thứ hạng */}
              <span className={`font-black ${i < 3 ? 'text-orange-500' : 'text-orange-300'}`}>
                {i + 1}
              </span>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border-2 border-orange-200 overflow-hidden shrink-0">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffedd5&color=f97316&bold=true`} 
                    alt="avt" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-bold truncate ${isMe ? 'text-orange-700' : 'text-gray-700'}`}>
                    {user.name}
                  </span>
                </div>
              </div>

              {/* Chỉ số thay đổi theo Tab */}
              <div className="text-right font-black">
                {tab === 'points' ? (
                  <span className="text-red-500">{user.score?.toLocaleString()}</span>
                ) : (
                  <span className="text-red-500">{user.streak || 0} 🔥</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;