import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; 
import { 
  HiOutlineAcademicCap, HiOutlinePlusCircle, 
  HiOutlineX, HiOutlineTrash, HiOutlineSave, 
  HiOutlineFolderAdd, HiOutlineCollection, HiChevronRight,
  HiOutlinePencilAlt, HiOutlineVolumeUp
} from "react-icons/hi";


const API_BASE_URL = "http://localhost:5252/api"; 

const Vocabulary = () => {
  const location = useLocation();
  // Thêm đoạn này vào đầu component Vocabulary
const userData = JSON.parse(localStorage.getItem('user'));
const currentUserId = localStorage.getItem("userId"); // Tùy theo cách bạn đặt tên trường lúc lưu login
  // --- DATA STATES ---
  const [collections, setCollections] = useState([]); 
  const [vocabData, setVocabData] = useState([]);     
  const [loading, setLoading] = useState(false);

  // --- UI STATES ---
  const [selectedSet, setSelectedSet] = useState(null); 
  const [editingWord, setEditingWord] = useState(null); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isCreateSetModalOpen, setIsCreateSetModalOpen] = useState(false);
  
  // State cho việc tạo bộ từ mới
  const [newCategoryName, setNewCategoryName] = useState("");
  // State cho bộ từ đang được chọn khi thêm từ mới
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [rows, setRows] = useState([{ id: Date.now(), hanzi: '', pinyin: '', meaning: '', type: '', example: '', note: '' }]);

  // --- FETCH DATA FROM BACKEND ---
  const fetchData = async () => {
  try {
    // Nếu không có ID thì không gọi API để tránh lỗi 400/404
    if (!currentUserId) return;

    const [cateRes, vocabRes] = await Promise.all([
      // Gọi đúng đường dẫn lấy theo user ID
      axios.get(`${API_BASE_URL}/Category/user/${currentUserId}`), 
      axios.get(`${API_BASE_URL}/Vocabulary`)
    ]);

    setCollections(cateRes.data);
    setVocabData(vocabRes.data);

    if (cateRes.data.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(cateRes.data[0].categoryID);
    }
  } catch (err) {
    console.error("Lỗi kết nối Backend:", err);
  }
};
  useEffect(() => {
    fetchData();
    if (location.state?.openAddTab) setIsAddModalOpen(true);
  }, [location]);


  // Xử lý tạo Bộ từ mới 
  const handleCreateCategory = async () => {
  if (!newCategoryName.trim()) return alert("Nhập tên bộ từ!");

  if (!currentUserId) {
    return alert("Vui lòng đăng nhập lại!");
  }

  try {
    await axios.post(`${API_BASE_URL}/Category`, {
      categoryName: newCategoryName,
      categoryType: "user",
      userID: parseInt(currentUserId) // Gửi ID của người đang login
    });
    
    alert("Tạo bộ từ thành công!");
    setNewCategoryName("");
    setIsCreateSetModalOpen(false);
    fetchData(); 
  } catch (err) {
    alert("Lỗi khi tạo bộ từ: " + (err.response?.data?.message || err.message));
  }
};

  // Xử lý Lưu tất cả các dòng từ vựng mới
  const handleSaveAllRows = async () => {
    const validRows = rows.filter(r => r.hanzi.trim() && r.meaning.trim());
    if (validRows.length === 0) return alert("Vui lòng nhập ít nhất 1 từ có Hán tự và Nghĩa!");
    if (!selectedCategoryId) return alert("Vui lòng chọn hoặc tạo một bộ từ!");

    try {
      setLoading(true);
      
      await Promise.all(validRows.map(row => 
        axios.post(`${API_BASE_URL}/Vocabulary`, {
          hanzi: row.hanzi,
          pinyin: row.pinyin,
          meaning: row.meaning,
          type: row.type,
          example: row.example,
          note: row.note,
          categoryID: selectedCategoryId // ID của bộ từ đang chọn ở dropdown
        })
      ));
      
      alert(`Đã lưu thành công ${validRows.length} từ!`);
      setRows([{ id: Date.now(), hanzi: '', pinyin: '', meaning: '', type: 'Danh từ', example: '', note: '' }]);
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Lỗi khi lưu từ vựng: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Cập nhật một từ 
const handleUpdateWord = async () => {
  try {
    // Backend cần VocaId (viết hoa chữ V theo Model C# của mày)
    const idToUpdate = editingWord.vocaId || editingWord.VocaId;

    if (!idToUpdate) {
      alert("Lỗi: Không tìm thấy VocaId!");
      return;
    }

    // Đảm bảo object gửi đi có chứa VocaId đúng tên Backend cần
    const dataToSend = { ...editingWord, VocaId: idToUpdate };

    await axios.put(`${API_BASE_URL}/Vocabulary/${idToUpdate}`, dataToSend); 

    alert("Cập nhật thành công!");
    setEditingWord(null); 
    fetchData(); 
  } catch (err) {
    alert("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
  }
};
  //  Xóa bộ từ
  const handleDeleteCollection = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Xóa bộ từ này sẽ mất hết dữ liệu bên trong. Đồng ý?")) {
      try {
        await axios.delete(`${API_BASE_URL}/Category/${id}`);
        fetchData();
      } catch (err) { alert("Không thể xóa bộ từ này!"); }
    }
  };

  // Xóa một từ lẻ
const handleDeleteWord = async (e, wordId) => {
    e.stopPropagation(); 
    // TRUYỀN ĐÚNG wordId (là cái vocaId từ API trả về)
    if (!wordId) return alert("Không tìm thấy ID của từ!"); 
    if (!window.confirm("Chắc muốn xóa từ này không?")) return;

    try {
        await axios.delete(`${API_BASE_URL}/Vocabulary/${wordId}`);
        alert("Xóa từ thành công!");
        
        // SỬA CHỖ NÀY: Dùng vocaId để filter
        setVocabData(prev => prev.filter(v => (v.vocaId || v.id) !== wordId)); 
        fetchData(); 
    } catch (err) {
        console.error("Lỗi xóa từ:", err);
        alert("Không xóa được từ này!");
    }
};
  //hỗ trợ đọc
  const speakHanzi = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; // Set tiếng Trung
    window.speechSynthesis.speak(utterance);
  };
  // Hàm lọc danh sách từ theo bộ 
  const filteredVocab = vocabData.filter(v => v.categoryID === selectedSet?.categoryID);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 animate-in fade-in duration-500 font-sans">
      
      {/* --- HEADER --- */}
      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[35px] border border-white shadow-xl flex justify-between items-center transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <HiOutlineAcademicCap size={26} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800 tracking-tight">Kho Từ Vựng</h2>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-[20px] text-xs font-black shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center gap-2"
        >
          <HiOutlinePlusCircle size={18} /> <span className="hidden sm:inline">THÊM TỪ MỚI</span>
        </button>
      </div>


      {/* --- DANH SÁCH BỘ TỪ --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {collections.map((set) => (
          <div 
            key={set.categoryID} 
            onClick={() => setSelectedSet(set)}
            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 ${set.categoryType === 'system' ? 'bg-slate-800' : 'bg-orange-500'} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <HiOutlineCollection size={28} />
              </div>
              <button 
                onClick={(e) => handleDeleteCollection(e, set.categoryID)}
                className="p-3 bg-red-50 text-red-500 rounded-xl transition-all 
             [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 
             [@media(hover:hover)]:bg-gray-50 [@media(hover:hover)]:text-gray-300
             hover:bg-red-50 hover:text-red-500"
              >
                <HiOutlineTrash size={20} />
              </button>
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">{set.categoryName}</h3>
            <p className="text-sm font-bold text-gray-400">
                {vocabData.filter(v => v.categoryID === set.categoryID).length} từ vựng
            </p>
            <div className="mt-6 flex justify-end">
              <div className="p-3 bg-gray-50 rounded-full group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                <HiChevronRight size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      


      {/* --- MODAL DANH SÁCH TỪ --- */}
      {selectedSet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-6xl h-full sm:h-auto sm:max-h-[85vh] sm:rounded-[45px] shadow-2xl overflow-hidden flex flex-col relative">
            <div className="p-6 sm:p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
              <h3 className="text-xl sm:text-2xl font-black text-gray-800 uppercase italic">Bộ: {selectedSet.categoryName}</h3>
              <button onClick={() => setSelectedSet(null)} className="p-3 bg-gray-100 rounded-2xl hover:bg-red-50 transition-all"><HiOutlineX size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 sm:p-8">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] sm:text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    <th></th>
                    <th className="px-4 py-4">Hán tự</th>
                    <th className="px-4 py-4">Pinyin</th>
                    <th className="px-4 py-4 hidden md:table-cell">Loại</th>
                    <th className="px-4 py-4">Nghĩa</th>
                    <th className="px-4 py-4 hidden lg:table-cell">Ví dụ</th>
                    <th className="px-4 py-4 hidden xl:table-cell">Ghi chú</th>
                    <th className="px-4 py-4 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVocab.map((item) => (
                    <tr 
                      key={item.vocaId || item.id}  // Đổi thành vocaId
    onClick={() => setEditingWord(item)}
                      className="bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <td className="px-4 py-5 rounded-l-[20px] text-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn việc mở modal edit khi bấm loa
                      speakHanzi(item.hanzi);
                    }}
                    className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <HiOutlineVolumeUp size={20}/>
                  </button>
                </td>
                      <td className="px-4 py-5 rounded-l-[20px] font-black text-xl sm:text-2xl text-gray-800">{item.hanzi}</td>
                      <td className="px-4 py-5 font-bold text-red-500 italic text-sm sm:text-base">[{item.pinyin}]</td>
                      <td className="px-4 py-5 hidden md:table-cell"><span className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[9px] font-black uppercase text-gray-400">{item.type}</span></td>
                      <td className="px-4 py-5 font-bold text-gray-700 text-sm sm:text-base">{item.meaning}</td>
                      <td className="px-4 py-5 hidden lg:table-cell text-xs text-gray-500 italic max-w-xs truncate">{item.example}</td>
                      <td className="px-4 py-5 hidden xl:table-cell text-xs text-gray-400">{item.note}</td>
                      <td className="px-4 py-5 rounded-r-[20px] text-center">
                        <button onClick={(e) => handleDeleteWord(e, item.vocaId || item.id)} className="p-3 text-gray-300 hover:text-red-500 transition-all"><HiOutlineTrash size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVocab.length === 0 && <p className="text-center py-10 font-bold text-gray-300">Bộ từ này đang trống...</p>}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDIT  --- */}
      {editingWord && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in zoom-in-95">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-6 sm:p-10 border border-white relative overflow-y-auto max-h-[90vh]">
            <h4 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3 italic uppercase">
              <HiOutlinePencilAlt className="text-red-600" size={24}/> Chỉnh sửa 
            </h4>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Hán tự</label>
                  <input type="text" value={editingWord.hanzi} onChange={(e) => setEditingWord({...editingWord, hanzi: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-2xl outline-none focus:ring-2 focus:ring-red-100 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Pinyin</label>
                  <input type="text" value={editingWord.pinyin} onChange={(e) => setEditingWord({...editingWord, pinyin: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-red-500 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Loại từ</label>
                < input type="text" value={editingWord.type} onChange={(e) => setEditingWord({...editingWord, type: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-600 outline-none appearance-none" />
              {/* <select value={editingWord.type} onChange={(e) => setEditingWord({...editingWord, type: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-600 outline-none appearance-none">
                  <option>Danh từ</option><option>Động từ</option><option>Tính từ</option><option>Trạng từ</option><option>Phó từ</option>
                </select> */}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Nghĩa</label>
               < input type="text" value={editingWord.meaning} onChange={(e) => setEditingWord({...editingWord, meaning: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Ví dụ đặt câu</label>
                <textarea rows="2" value={editingWord.example} onChange={(e) => setEditingWord({...editingWord, example: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-medium text-sm outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Ghi chú</label>
                <input type="text" value={editingWord.note} onChange={(e) => setEditingWord({...editingWord, note: e.target.value})} className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm outline-none" />
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={() => setEditingWord(null)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase">Hủy</button>
              <button onClick={handleUpdateWord} className="flex-1 py-4 bg-red-600 text-white rounded-[20px] font-black text-xs shadow-lg active:scale-95 transition-all">LƯU</button>
            </div>
          </div>
        </div>
      )}


      {/* --- MODAL THÊM TỪ MỚI  --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-7xl h-full sm:h-auto sm:max-h-[92vh] sm:rounded-[45px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-gray-50 flex items-center justify-between shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h3 className="text-xl font-black text-gray-800 uppercase italic">Thêm từ mới</h3>
                <div className="flex items-center gap-4">
                  <select 
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-xs outline-none"
                  >
                    {collections.map(c => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
                  </select>
                  <button onClick={() => setIsCreateSetModalOpen(true)} className="text-sm font-bold text-red-500 underline underline-offset-4"><HiOutlineFolderAdd size={20}/></button>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-3 bg-gray-100 rounded-2xl transition-all"><HiOutlineX size={24} /></button>
            </div>

            <div className="flex-1 overflow-auto px-6 sm:px-10 py-6">
              <table className="w-full border-separate border-spacing-y-2 min-w-[900px]">
                <thead>
                  <tr className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="pb-4 px-2">Hán tự *</th>
                    <th className="pb-4 px-2">Pinyin</th>
                    <th className="pb-4 px-2">Nghĩa *</th>
                    <th className="pb-4 px-2">Loại</th>
                    <th className="pb-4 px-2">Ví dụ</th>
                    <th className="pb-4 px-2">Ghi chú</th>
                    <th className="pb-4 px-2 text-center w-16">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="p-1">
                        <input 
                            type="text" 
                            className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold focus:border-red-500" 
                            value={row.hanzi}
                            onChange={(e) => {
                                const newRows = [...rows];
                                newRows[index].hanzi = e.target.value;
                                setRows(newRows);
                            }}
                            placeholder="学习" 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                            type="text" 
                            className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold text-red-500" 
                            value={row.pinyin}
                            onChange={(e) => {
                                const newRows = [...rows];
                                newRows[index].pinyin = e.target.value;
                                setRows(newRows);
                            }}
                            placeholder="xuéxí" 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                            type="text" 
                            className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none font-bold" 
                            value={row.meaning}
                            onChange={(e) => {
                                const newRows = [...rows];
                                newRows[index].meaning = e.target.value;
                                setRows(newRows);
                            }}
                            placeholder="Học tập" 
                        />
                      </td>
                      <td className="p-1">
                         <input 
                            type="text" 
                            className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold"
                            value={row.type}
                            onChange={(e) => {
                                const newRows = [...rows];
                                newRows[index].type = e.target.value;
                                setRows(newRows);
                            }}
                            placeholder='Động từ...'
                        />
                      </td>
                      <td className="p-1">
                        <input 
                            type="text" 
                            className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none text-xs" 
                            value={row.example}
                            onChange={(e) => {
                                const newRows = [...rows];
                                newRows[index].example = e.target.value;
                                setRows(newRows);
                            }}
                            placeholder="Ví dụ..." 
                        />
                      </td>
                      <td className="p-1">
                        <input 
                            type="text" 
                            className="w-full px-4 py-4 bg-white border border-gray-100 rounded-xl outline-none text-xs" 
                            value={row.note}
                            onChange={(e) => {
                                const newRows = [...rows];
                                newRows[index].note = e.target.value;
                                setRows(newRows);
                            }}
                            placeholder="Ghi chú..." 
                        />
                      </td>
                      <td className="p-1 text-center"><button onClick={() => setRows(rows.filter(r => r.id !== row.id))} className="p-4 bg-red-50 text-red-500 rounded-xl"><HiOutlineTrash size={18} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setRows([...rows, { id: Date.now(), hanzi: '', pinyin: '', meaning: '', type: 'Danh từ', example: '', note: '' }])} className="w-full mt-6 py-5 border-2 border-dashed border-gray-200 rounded-[30px] text-gray-400 font-black text-xs hover:text-red-500 transition-all flex items-center justify-center gap-3">+ THÊM DÒNG MỚI</button>
            </div>

            <div className="px-10 py-8 border-t border-gray-50 flex justify-end items-center bg-white shrink-0">
               <button 
                onClick={handleSaveAllRows}
                disabled={loading}
                className={`w-full sm:w-auto px-16 py-5 ${loading ? 'bg-gray-400' : 'bg-[#00D060] hover:bg-[#00B855]'} text-white rounded-[24px] font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all`}
               >
                 <HiOutlineSave size={22} /> {loading ? 'ĐANG LƯU...' : 'LƯU'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL TẠO BỘ TỪ MỚI  --- */}
      {isCreateSetModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10">
            <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 uppercase italic"><HiOutlineFolderAdd size={28} className="text-red-600" /> Tạo bộ từ mới</h4>
            <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Tên bộ từ ..." 
                className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:border-red-500 transition-all" 
            />
            <div className="flex gap-4 mt-10">
              <button onClick={() => setIsCreateSetModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase">Hủy</button>
              <button onClick={handleCreateCategory} className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all uppercase">Tạo ngay</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Vocabulary;

