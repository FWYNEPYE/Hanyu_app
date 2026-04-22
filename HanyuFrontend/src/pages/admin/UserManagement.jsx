import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiOutlineSearch, HiOutlineTrash, HiOutlineTicket, HiOutlineShieldExclamation } from "react-icons/hi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  //  Hàm lấy danh sách User
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = searchTerm 
        ? `http://localhost:5252/api/admin/users/search?query=${searchTerm}`
        : `http://localhost:5252/api/admin/users`;
        
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoint = async (id) => {
    const amount = prompt("Bạn muốn nạp bao nhiêu?");
    if (!amount || isNaN(amount)) return;

    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5252/api/admin/users/${id}/add-point`, amount, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json' 
            }
        });
        alert("Nạp thành công! Đã bơm " + amount + " point.");
        fetchUsers(); 
    } catch (err) {
        alert("Lỗi nạp point rồi sếp ơi!");
    }
};

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 500); 

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  
  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5252/api/admin/users/toggle-status/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(users.map(u => u.userID === id ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi cập nhật");
    }
  };

  //  Hàm Xóa 
  
  const handleDelete = async (id) => {
    if (!window.confirm("Sếp có chắc muốn đuổi học viên này khỏi hệ thống không?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5252/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.userID !== id));
    } catch (err) {
      alert("Không xóa được!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white ">Quản lý Người dùng</h2>
        <div className="bg-[#161B26] px-4 py-2 rounded-xl border border-slate-700/50 flex items-center w-80 shadow-inner">
          <HiOutlineSearch className="text-slate-500 mr-2" />
          <input 
            type="text" 
            placeholder="Tìm tên, email..." 
            className="bg-transparent border-none focus:ring-0 text-sm text-slate-200 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#161B26] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#1E2533]/50 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-b border-slate-800">
            <tr>
              <th className="px-8 py-5">Người dùng</th>
              <th className="px-8 py-5">Vai trò</th>
              <th className="px-8 py-5 text-center">Point / Rank</th>
              <th className="px-8 py-5">Trạng thái</th>
              <th className="px-8 py-5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr><td colSpan="5" className="text-center py-10 text-slate-500">Đang tra cứu hồ sơ...</td></tr>
            ) : users.map(user => (
              <tr key={user.userID} className="hover:bg-white/[0.02] transition-colors group text-sm">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-500/20">
                        {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-bold">{user.username}</div>
                      <div className="text-slate-500 text-[10px]  tracking-tighter">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-700 text-slate-300'}`}>
                        {user.role}
                    </span>
                </td>
                <td className="px-8 py-5 text-center">
                    <div className="text-orange-400 font-black">{user.points || 0}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{user.rank || 'Tân thủ'}</div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {user.isActive ? 'Hoạt động' : 'Khóa'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 translate-x-2">
                    
                    {/* NÚT NẠP POINT  */}
                    <button 
                        onClick={() => handleAddPoint(user.userID)}
                        className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-lg" 
                        title="Nạp Point"
                    >
                        <HiOutlineTicket size={18}/>
                    </button>

                    {/* NÚT KHÓA/MỞ KHÓA  */}
                    <button 
                        onClick={() => handleToggleStatus(user.userID)}
                        className={`p-2.5 rounded-xl transition-all shadow-lg ${user.isActive ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500' : 'bg-green-500/10 text-green-400 hover:bg-green-500'} hover:text-white`} 
                        title={user.isActive ? "Khóa mõm" : "Mở khóa"}
                    >
                        <HiOutlineShieldExclamation size={18}/>
                    </button>

                    {/* NÚT XÓA */}
                    <button 
                        onClick={() => handleDelete(user.userID)}
                        className="p-2.5 bg-slate-800 text-slate-400 rounded-xl hover:bg-white hover:text-black transition-all" 
                        title="Xóa vĩnh viễn"
                    >
                        <HiOutlineTrash size={18}/>
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;