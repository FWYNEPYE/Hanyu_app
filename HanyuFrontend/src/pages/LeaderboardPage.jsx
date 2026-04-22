import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Leaderboard from '../components/Leaderboard';
import ActivityTracker from '../components/ActivityTracker';
import SentencePuzzle from '../components/SentencePuzzle';
import CommunityChat from '../components/CommunityChat';


import { useOutletContext } from 'react-router-dom';


const LeaderboardPage = () => {

  const { triggerCoinFly, fetchUserData } = useOutletContext();


  const [data, setData] = useState({
    users: [],
    activity: new Array(98).fill(0),
    puzzle: null,
    loading: true
  });


  
  const userId = localStorage.getItem('userId');

const fetchAllData = async () => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token'); // Lấy Token sếp đã lưu lúc Login
  
  if (!userId || !token) return;

  const baseUrl = 'http://localhost:5252/api/social';
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  try {
    const [leaderboardRes, activityRes] = await Promise.all([
      axios.get(`${baseUrl}/leaderboard`),
      axios.get(`${baseUrl}/activity-stats/${userId}`)
    ]);

    let puzzleData = null;
    try {
      // Gọi API không cần userId ở URL nữa vì đã có Token
      const puzzleRes = await axios.get(`${baseUrl}/daily-puzzle`, config); 
      puzzleData = puzzleRes.data;
    } catch (err) {
      console.log("Hết câu đố hoặc lỗi Token");
    }

    setData({
      users: leaderboardRes.data,
      activity: activityRes.data,
      puzzle: puzzleData,
      loading: false
    });
  } catch (error) {
    console.error("Lỗi fetch data chung", error);
  }
};



 useEffect(() => {
    fetchAllData();
  }, [userId]);

  if (data.loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-orange-500 animate-pulse">
      ĐANG TẢI...
    </div>
  );

  return ( 
    <div className="bg-white min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-start">
        
        {/* CỘT BẢNG XẾP HẠNG */}
        <div className="flex flex-col gap-6 order-1">
          <h2 className="text-2xl font-black text-orange-600 uppercase flex items-center gap-3">
            <span className="p-3 bg-orange-100 rounded-2xl shadow-sm">🏆</span> 
            Bảng Xếp Hạng
          </h2>
          <Leaderboard data={data.users} currentUserId={userId} />
        </div>

        {/* CỘT TIỆN ÍCH */}
        <div className="flex flex-col gap-8 order-2">
          <div>
            <h3 className="text-sm font-black text-orange-500 mb-4 uppercase tracking-widest ">Tiến độ học tập</h3>
            <ActivityTracker data={data.activity} />
          </div>

          <SentencePuzzle 
            puzzleData={data.puzzle} 
            userId={userId} 
            onRefresh={fetchAllData} 
            triggerCoinFly={triggerCoinFly}
            fetchUserData={fetchUserData}
          />

          <CommunityChat />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;