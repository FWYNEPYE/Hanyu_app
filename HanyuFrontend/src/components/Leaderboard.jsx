import React from 'react';

const Leaderboard = ({ data }) => {
  return (
    <div className="w-full bg-white rounded-[30px] border-2 border-orange-100 overflow-hidden shadow-sm">
      {/* Tab Header */}
      <div className="flex p-2 bg-orange-50 border-b-2 border-orange-100">
        <button className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#c2410c] active:translate-y-1 active:shadow-none transition-all">
          🔥 Hoạt động
        </button>
        <button className="flex-1 py-3 px-4 text-orange-600 font-black text-sm flex items-center justify-center gap-2 hover:bg-orange-100 rounded-2xl transition-all">
          Streak ⚡
        </button>
      </div>

      <div className="grid grid-cols-[50px_1fr_80px] px-6 py-4 border-b border-orange-50 bg-white">
        <span className="text-[10px] font-black text-orange-300 uppercase italic">Hạng</span>
        <span className="text-[10px] font-black text-orange-300 uppercase italic">Thành viên</span>
        <span className="text-[10px] font-black text-orange-300 uppercase italic text-right">Điểm</span>
      </div>

      <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
        {data.map((user, i) => (
          <div key={user.id} className={`grid grid-cols-[50px_1fr_80px] items-center px-6 py-4 border-b border-orange-50 last:border-0 ${user.isMe ? 'bg-orange-50' : ''}`}>
            <span className="font-black text-orange-400 text-sm">{i + 1}</span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-orange-200 overflow-hidden">
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=ffedd5&color=f97316`} alt="avatar" />
              </div>
              <span className={`font-bold text-gray-700 truncate text-sm ${user.isMe ? 'text-orange-600' : ''}`}>{user.name}</span>
            </div>
            <div className="text-right font-black text-red-500 text-sm">
              {user.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;