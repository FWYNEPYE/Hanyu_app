import React, { useState, useEffect } from 'react';
import { 
  HiOutlineTrendingUp, HiOutlineUsers, HiOutlineBookOpen, 
  HiOutlineLightningBolt, HiOutlineDownload, HiOutlineChartPie 
} from "react-icons/hi";
import axios from 'axios';

const Analytics = () => {
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalLessons: "0",
    totalAiChat: "0",
    retentionRate: "0%"
  });
  const [growthData, setGrowthData] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [resOverview, resGrowth, resRanks] = await Promise.all([
          axios.get('http://localhost:5252/api/AdminAnalytics/overview'),
          axios.get('http://localhost:5252/api/AdminAnalytics/user-growth'),
          axios.get('http://localhost:5252/api/AdminAnalytics/rank-distribution')
        ]);

        setOverview(resOverview.data);
        setGrowthData(resGrowth.data);
        setRanks(resRanks.data);
      } catch (err) {
        console.error("Lỗi soi số liệu rồi sếp ơi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleExportExcel = () => {
    const confirmExport = window.confirm("Xuất danh sách học viên ra file Excel?");
    if (confirmExport) {
      window.location.href = 'http://localhost:5252/api/AdminAnalytics/export-report';
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-700 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      {/* HEADER & EXPORT */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white   tracking-tighter">Thống kê & Báo cáo</h2>
        </div>
        <button 
          onClick={handleExportExcel} 
          disabled={loading}
          className="bg-[#161B26] hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-2xl border border-slate-700 text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <HiOutlineDownload size={18} className="text-blue-500 animate-bounce" /> {loading ? 'Đang xử lý...' : 'Xuất file Excel (Báo cáo tháng)'}
        </button>
      </div>

      {/* CÁC CHỈ SỐ NHANH */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<HiOutlineUsers className="text-blue-500" />} label="Tổng học viên" value={overview.totalUsers} growth="+12%" loading={loading} />
        <StatCard icon={<HiOutlineBookOpen className="text-green-500" />} label="Bài học đã xong" value={overview.totalLessons} growth="+5.4%" loading={loading} />
        <StatCard icon={<HiOutlineLightningBolt className="text-yellow-500" />} label="Lượt Chat AI" value={overview.totalAiChat} growth="+22%" loading={loading} />
        <StatCard icon={<HiOutlineTrendingUp className="text-purple-500" />} label="Tỷ lệ giữ chân" value={overview.retentionRate} growth="+2%" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BIỂU ĐỒ TĂNG TRƯỞNG */}
        <div className="lg:col-span-2 bg-[#161B26] border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-white font-black uppercase text-xs tracking-widest flex items-center gap-2">
                <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><HiOutlineTrendingUp/></span>
                Biểu đồ tăng trưởng người dùng
            </h3>
            <select 
              readOnly 
              value="2026" 
              className="bg-[#0B0F1A] border border-slate-800 text-[10px] font-black text-slate-400 px-3 py-1.5 rounded-xl outline-none focus:border-blue-500 transition-all cursor-not-allowed"
            >
                <option value="2026">Năm 2026</option>
                <option value="2025">Năm 2025</option>
            </select>
          </div>
          

<div className="h-64 flex items-end gap-3 px-2">
  {growthData.length > 0 ? (() => {
    const realMax = Math.max(...growthData.map(d => d.value));
    
    const chartMax = realMax > 5 ? realMax : 5; 

    return growthData.map((data, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
        <div className="relative w-full flex flex-col items-center justify-end h-full">

          <div className="absolute -top-8 bg-blue-600 text-[10px] font-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {data.value} Users
          </div>
          

          <div 
            className="w-full bg-gradient-to-t from-[#A5D8FF]/20 to-[#A5D8FF] rounded-t-xl transition-all duration-700 group-hover:brightness-110 shadow-[0_0_15px_rgba(165,216,255,0.3)]"
            style={{ 
              height: `${(data.value / chartMax) * 100}%`, 
              minHeight: data.value > 0 ? '15px' : '7px' 
            }}
          ></div>
        </div>
        <span className="text-[9px] font-black text-slate-600 uppercase">{data.name}</span>
      </div>
    ));
  })() : (
    <div className="w-full h-full flex items-center justify-center text-slate-700 italic text-xs">
      Đang phân tích dữ liệu...
    </div>
  )}
</div>
        </div>

        {/* PHÂN BỔ TRÌNH ĐỘ */}
        <div className="bg-[#161B26] border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-white font-black uppercase text-xs tracking-widest mb-8 flex items-center gap-2">
                <span className="p-2 bg-pink-500/10 rounded-lg text-pink-500"><HiOutlineChartPie/></span>
                Phân bổ trình độ
            </h3>
            <div className="space-y-6">
                {ranks.length > 0 ? ranks.map((rank, i) => (
                    <LevelProgress 
                      key={i} 
                      label={rank.label} 
                      percent={rank.percent} 
                      color={i === 0 ? "bg-[#B2F2BB]" : i === 1 ? "bg-[#D0BFFF]" : "bg-pink-500"} 
                    />
                )) : (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 bg-slate-800/50 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                )}
            </div>
            <div className="mt-10 p-5 bg-gradient-to-br from-[#0B0F1A] to-[#161B26] rounded-3xl border border-slate-800/50 text-center relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Dự đoán hệ thống</p>
                    <p className="text-white text-sm font-black group-hover:text-blue-400 transition-colors">Dự kiến tăng trưởng ổn định</p>
                </div>
                <HiOutlineTrendingUp className="absolute -right-4 -bottom-4 text-white/[0.02]" size={80} />
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, growth, loading }) => (
  <div className="bg-[#161B26] border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500/50 transition-all group shadow-xl">
    <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-[#0B0F1A] rounded-2xl border border-slate-800 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        {!loading && (
          <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10 uppercase">
              {growth}
          </span>
        )}
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
    <p className="text-3xl font-black text-white mt-1 tracking-tighter">
      {loading ? "---" : value}
    </p>
  </div>
);

const LevelProgress = ({ label, percent, color }) => (
    <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400">{label}</span>
            <span className="text-white">{percent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
            <div 
              className={`h-full ${color} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.2)]`} 
              style={{ width: `${percent}%` }}
            ></div>
        </div>
    </div>
);

export default Analytics;