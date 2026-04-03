import React from 'react';

const CommunityChat = () => {
  const messages = [
    { user: "Ối dổ ôi", text: "Bài tập hôm nay hơi khó nha...", time: "14 giờ trước" },
    { user: "Ố sồ ô", text: "Học Hanyu thích thíiiii!", time: "vừa xong" },
  ];

  return (
    <div className="bg-white rounded-[30px] border-2 border-orange-100 shadow-sm overflow-hidden">
      <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
        <h3 className="font-black text-orange-700 text-sm">💬 Trò chuyện cộng đồng</h3>
        <button className="text-orange-400 rotate-0 hover:rotate-180 transition-all">🔄</button>
      </div>
      <div className="p-4 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-200 shrink-0"></div>
            <div>
              <div className="flex gap-2 items-center">
                <span className="font-black text-xs text-gray-700">{m.user}</span>
                <span className="text-[9px] text-gray-400">{m.time}</span>
              </div>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-xl rounded-tl-none mt-1">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-orange-50">
        <input 
          type="text" 
          placeholder="Viết gì đó đi..." 
          className="w-full p-2 bg-gray-50 rounded-xl text-xs border-2 border-transparent focus:border-orange-200 outline-none transition-all"
        />
      </div>
    </div>
  );
};

export default CommunityChat;