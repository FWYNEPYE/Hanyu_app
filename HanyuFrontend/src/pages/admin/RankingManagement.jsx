import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineFire, HiOutlineUserRemove, HiOutlineStar } from "react-icons/hi";

const RankingManagement = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchRankings = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`http://localhost:5252/api/AdminRanking/list`);
    setRankings(res.data);
  } catch (error) {
    console.error("Lỗi bốc dữ liệu:", error);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => { 
    fetchRankings(); 
  }, [filter]);


  
const handleRemoveRank = async (userId) => {
  if(window.confirm("Chắc chắn muốn hủy hạng người này chứ? ")) {
    try {
      await axios.delete(`http://localhost:5252/api/AdminRanking/reset/${userId}`);
      alert("Đã 'trảm' xong!");
      fetchRankings(); 
    } catch (error) {
      alert("Lỗi khi hủy hạng!");
      console.error(error);
    }
  }
};
  const getRankBadge = (index) => {
    if (index === 0) return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
    if (index === 1) return "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]";
    if (index === 2) return "text-orange-600 drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]";
    return "text-slate-600";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white  tracking-tighter ">Quản lý Bảng xếp hạng</h2>
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-[#161B26] border border-slate-700 text-xs font-bold text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        >
          <option value="all">Tất cả thời gian</option>
          <option value="month">Tháng này</option>
          <option value="week">Tuần này</option>
        </select>
      </div>

      <div className="bg-[#161B26]/50 backdrop-blur-xl border border-slate-800 rounded-[32px] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1E2533]/50 text-[10px] font-black uppercase text-slate-500 tracking-widest">
            <tr>
              <th className="px-8 py-6 text-center">Hạng</th>
              <th className="px-8 py-6">Người học</th>
              <th className="px-8 py-6">Tổng Points</th>
              <th className="px-8 py-6">Streak</th>
              <th className="px-8 py-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center text-slate-500 font-bold animate-pulse">Đang tải bảng xếp hạng...</td></tr>
            ) : rankings.length === 0 ? (
              <tr><td colSpan="5" className="p-20 text-center text-slate-500">Không có dữ liệu xếp hạng.</td></tr>
            ) : rankings.map((item, index) => (
              <tr key={index} className="hover:bg-white/[0.02] transition-all group">
                <td className={`px-8 py-6 text-center font-black text-xl  ${getRankBadge(index)}`}>
                  <div className="flex items-center justify-center gap-2">
                    {index < 3 && <HiOutlineStar size={20} />}
                    #{index + 1}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs  text-white">
                      {(item.userName || item.name || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-white font-bold">{item.userName || item.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-orange-400 font-black text-base">
                  {(item.totalPoints || item.score || 0).toLocaleString()}
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2 text-rose-500 font-bold">
                     <HiOutlineFire /> {item.streak || 0} ngày
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <button 
                    onClick={() => handleRemoveRank(item.userId || item.id)}
                    className="text-slate-500 hover:text-rose-500 transition-colors p-2"
                    title="Hủy hạng"
                   >
                     <HiOutlineUserRemove size={20} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingManagement;