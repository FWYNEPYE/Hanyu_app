import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; 
import { 
  HiOutlineAcademicCap, HiOutlinePlusCircle, HiOutlineTrash, HiOutlineSave, 
  HiOutlineCollection, HiOutlineGlobeAlt, HiOutlineLockClosed
} from "react-icons/hi";
import { useOutletContext } from 'react-router-dom';

// Import các Modal từ thư mục components
import VocabListModal from '../components/VocabListModal';
import EditVocabModal from '../components/EditVocabModal';
import AddWordModal from '../components/AddWordModal';
import CreateSetModal from '../components/CreateSetModal';
import PublishSetModal from '../components/PublishSetModal';

const API_BASE_URL = "/api"; 

const Vocabulary = () => {
  const location = useLocation();
  const { triggerCoinFly, fetchUserData } = useOutletContext();
  
  // --- DATA STATES ---
  const [collections, setCollections] = useState([]); 
  const [vocabData, setVocabData] = useState([]);     
  const [loading, setLoading] = useState(false);
  const [publicIcon, setPublicIcon] = useState('📚'); 
  const [publicColor, setPublicColor] = useState('bg-[#ECFAF3]'); 
  const [publicTag, setPublicTag] = useState(''); 
  const [selectedSet, setSelectedSet] = useState(null); 
  const [editingWord, setEditingWord] = useState(null); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isCreateSetModalOpen, setIsCreateSetModalOpen] = useState(false);
  const [isPublicModalOpen, setIsPublicModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState(null); 
  const [publicPrice, setPublicPrice] = useState(0);
  const [publicDesc, setPublicDesc] = useState("");

  const storedUser = localStorage.getItem('user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const currentUserId = localStorage.getItem("userId") || userData?.userId || userData?.id;

  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [rows, setRows] = useState([{ id: Date.now(), hanzi: '', pinyin: '', meaning: '', type: '', example: '', note: '' }]);

  const fetchData = async () => {
    try {
      if (!currentUserId) return;

      const [collectionRes, vocabRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/Category/my-collection/${currentUserId}`), 
        axios.get(`${API_BASE_URL}/Vocabulary`)
      ]);

      const owned = (collectionRes.data.ownedByMe || []).map(item => ({
        ...item,
        categoryID: String(item.categoryID), 
        isBorrowed: false 
      }));
       
      setCollections(owned);
      setVocabData(vocabRes.data);

      if (owned.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(owned[0].categoryID);
      }
    } catch (err) {
      console.error("Lỗi kết nối Backend:", err);
    }
  };

  useEffect(() => {
    fetchData();
    if (location.state?.openAddTab) setIsAddModalOpen(true);
  }, [location]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Nhập tên bộ từ!");
      throw new Error("Tên bộ từ trống");
    }
    if (!currentUserId) {
      alert("Vui lòng đăng nhập lại!");
      throw new Error("Chưa đăng nhập");
    }

    try {
      setLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/Category`, {
        categoryName: newCategoryName,
        categoryType: "user",
        userID: parseInt(currentUserId)
      });
      
      if (response.data) {
        const newCreatedSet = {
          ...response.data,
          categoryID: String(response.data.categoryID || response.data.id),
          isBorrowed: false
        };
        setCollections(prev => [...prev, newCreatedSet]);
      }

      setTimeout(() => {
        setNewCategoryName("");
        setIsCreateSetModalOpen(false);
      }, 1000);

    } catch (err) {
      alert("Lỗi khi tạo bộ từ: " + (err.response?.data?.message || err.message));
      throw err; 
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategoryName = async (categoryId, newName) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/Category/${categoryId}`, {
        userID: parseInt(currentUserId),
        categoryName: newName
      }, { headers: { Authorization: `Bearer ${token}` } });

      setCollections(prev => prev.map(cat => 
        String(cat.categoryID) === String(categoryId) ? { ...cat, categoryName: newName } : cat
      ));

      setSelectedSet(prev => prev ? { ...prev, categoryName: newName } : null);

    } catch (err) {
      alert("Không thể đổi tên bộ từ: " + (err.response?.data?.message || err.message));
      throw err;
    }
  };

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
          categoryID: selectedCategoryId 
        })
      ));
      
      setIsAddModalOpen(false);
      setRows([{ id: Date.now(), hanzi: '', pinyin: '', meaning: '', type: '', example: '', note: '' }]);
      fetchData();
    } catch (err) {
      alert("Lỗi khi lưu từ vựng: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWord = async () => {
    try {
      const idToUpdate = editingWord.vocaId || editingWord.VocaId || editingWord.id;
      if (!idToUpdate) throw new Error("Lỗi: Không tìm thấy VocaId!");

      const dataToSend = { ...editingWord, VocaId: idToUpdate };
      await axios.put(`${API_BASE_URL}/Vocabulary/${idToUpdate}`, dataToSend); 
      await fetchData(); 
    } catch (err) {
      console.error("Lỗi cập nhật từ vựng:", err);
      throw err;
    }
  };

  const handleDeleteCollection = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Xóa bộ từ này sẽ mất hết dữ liệu bên trong. Chắc chắn xóa?")) {
      try {
        const userId = localStorage.getItem('userId');
        await axios.delete(`${API_BASE_URL}/Category/${id}/${userId}`);
        fetchData();
      } catch (err) { alert("Không thể xóa bộ từ này!"); }
    }
  };

  const handleDeleteWord = async (e, wordId) => {
    e.stopPropagation(); 
    if (!wordId) return alert("Không tìm thấy ID của từ!"); 
    if (!window.confirm("Chắc muốn xóa từ này không?")) return;

    try {
        await axios.delete(`${API_BASE_URL}/Vocabulary/${wordId}`);
        setVocabData(prev => prev.filter(v => (v.vocaId || v.id) !== wordId)); 
        fetchData(); 
    } catch (err) {
        console.error("Lỗi xóa từ:", err);
        alert("Không xóa được từ này!");
    }
  };

  const speakHanzi = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; 
    window.speechSynthesis.speak(utterance);
  };

  const filteredVocab = vocabData.filter(v => 
    String(v.categoryID) === String(selectedSet?.categoryID)
  );

  const detectHSKLevel = (words) => {
    if (!words || words.length === 0) return "Gen";
    const level = targetCategory?.categoryName?.match(/\d+/)?.[0] || "3"; 
    return `HSK ${level}`;
  };

  const handleTogglePublic = async () => {
    if (!targetCategory || targetCategory.isBorrowed) return;

    const currentWordCount = vocabData.filter(
      v => String(v.categoryID) === String(targetCategory.categoryID)
    ).length;

    const token = localStorage.getItem('token');
    try {
      const updateData = {
        isPublic: true, 
        price: parseInt(publicPrice) || 0,
        description: publicDesc,
        icon: publicIcon,      
        themeColor: publicColor,  
        tags: publicTag,
        wordCount: currentWordCount 
      };

      const response = await axios.put(
        `${API_BASE_URL}/Category/${targetCategory.categoryID}/public-settings?userId=${currentUserId}`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.pointsEarned > 0) {
          const addedPoints = response.data.pointsEarned;
          const totalPoints = response.data.currentPoints;
          
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.points = totalPoints; 
          localStorage.setItem('user', JSON.stringify(user));

          window.dispatchEvent(new Event("updatePoints")); 
          triggerCoinFly();
          alert(`🎉 Chúc mừng! Bạn nhận được thêm ${addedPoints} điểm thưởng. \nTổng điểm hiện tại: ${totalPoints}`);
      }

      setIsPublicModalOpen(false);
      fetchData(); 
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSetPrivate = async (e, set) => {
    e.stopPropagation();
    if (!window.confirm(`Sếp có chắc muốn hủy công khai bộ từ "${set.categoryName}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        isPublic: false,
        price: set.price || 0,
        description: set.description || "",
        icon: set.icon || "📚",
        themeColor: set.themeColor || "bg-[#ECFAF3]",
        tags: set.tags || ""
      };

      await axios.put(
        `${API_BASE_URL}/Category/${set.categoryID}/public-settings?userId=${currentUserId}`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCollections(prev => prev.map(cat => 
        cat.categoryID === set.categoryID ? { ...cat, isPublic: false } : cat
      ));
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8 pb-24 sm:pb-10 px-3 sm:px-4 animate-in fade-in duration-500 font-sans">
      
      {/* --- HEADER --- */}
      <div className="bg-white/70 backdrop-blur-xl p-3.5 sm:p-6 rounded-[20px] sm:rounded-[35px] border border-white shadow-xl flex justify-between items-center">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg">
            <HiOutlineAcademicCap size={22} className="sm:size-[26px]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-800 tracking-tight">Kho Từ Vựng</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl sm:rounded-[20px] text-xs font-black shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <HiOutlinePlusCircle size={18} /> <span>THÊM TỪ MỚI</span>
          </button>
        </div>
      </div>

      {/* --- DANH SÁCH BỘ TỪ (Đã sửa responsive từ 1 cột mượt lên nhiều cột) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {collections.map((set) => (
          <div 
            key={`set-${set.categoryID}-${set.isBorrowed}`}
            onClick={() => setSelectedSet(set)}
            className="bg-white p-5 sm:p-8 rounded-[20px] sm:rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[140px] sm:min-h-[220px]"
          >
            <div className="flex justify-between items-start mb-3 sm:mb-2">
              <div className={`w-10 h-10 sm:w-14 sm:h-14 ${set.categoryType === 'system' ? 'bg-slate-800' : 'bg-orange-500'} rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <HiOutlineCollection className="text-xl sm:text-2xl" />
              </div>
              <button 
                type="button"
                onClick={(e) => handleDeleteCollection(e, set.categoryID)}
                className="p-2 sm:p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
              >
                <HiOutlineTrash size={18} />
              </button>
            </div>

            <div className="mb-4 sm:mb-12">
              <h3 className="text-base sm:text-2xl font-black text-gray-800 mb-1 line-clamp-1">
                {set.categoryName}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-gray-400">
                {vocabData.filter(v => v.categoryID === set.categoryID).length} từ vựng
              </p>
            </div>

            <div className="flex items-center gap-2 mt-auto">
                {set.categoryType !== 'system' ? (
                  <>
                    <button 
                      type="button"
                      disabled={set.isBorrowed} 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (set.isBorrowed) return; 
                        setTargetCategory(set);
                        setIsPublicModalOpen(true);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border transition-all text-[11px] sm:text-[10px]
                        ${set.isBorrowed 
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                          : set.isPublic 
                            ? 'bg-green-50 border-green-200 text-green-600' 
                            : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      {set.isBorrowed ? <HiOutlineSave size={16}/> : <HiOutlineGlobeAlt size={16}/>}
                      <span className="font-black uppercase tracking-wider">
                        {set.isBorrowed ? "Đã lưu từ cộng đồng" : (set.isPublic ? "Đã công khai" : "Đăng cộng đồng")}
                      </span>
                    </button>

                    {set.isPublic && !set.isBorrowed && (
                      <button
                        type="button"
                        onClick={(e) => handleSetPrivate(e, set)}
                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                        title="Hủy công khai"
                      >
                        <HiOutlineLockClosed className="w-4 h-4" />
                      </button>
                    )}
                  </>
                ) : (
                  <div />
                )}
            </div>
          </div>
        ))}
      </div>

      {/* --- CÁC MODAL --- */}
      {selectedSet && (
        <VocabListModal 
          selectedSet={selectedSet}
          onClose={() => setSelectedSet(null)}
          filteredVocab={filteredVocab}
          setEditingWord={setEditingWord}
          speakHanzi={speakHanzi}
          handleDeleteWord={handleDeleteWord}
          onUpdateCategoryName={handleUpdateCategoryName}
        />
      )}

      {editingWord && (
        <EditVocabModal 
          editingWord={editingWord}
          setEditingWord={setEditingWord}
          onCancel={() => setEditingWord(null)}
          onUpdate={handleUpdateWord}
        />
      )}

      <AddWordModal 
        isOpen={isAddModalOpen}          
        onClose={() => setIsAddModalOpen(false)}
        collections={collections}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        rows={rows}
        setRows={setRows}
        loading={loading}
        onSave={handleSaveAllRows}        
        onOpenCreateSet={() => setIsCreateSetModalOpen(true)} 
      />

      <CreateSetModal 
        isOpen={isCreateSetModalOpen}
        onClose={() => setIsCreateSetModalOpen(false)}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        onCreate={handleCreateCategory}
        loading={loading}
      />

      <PublishSetModal 
        isOpen={isPublicModalOpen}
        targetCategory={targetCategory}
        userData={userData}
        vocabData={vocabData}
        detectHSKLevel={detectHSKLevel}
        publicColor={publicColor}
        setPublicColor={setPublicColor}
        publicPrice={publicPrice}
        setPublicPrice={setPublicPrice}
        publicIcon={publicIcon}
        setPublicIcon={setPublicIcon}
        publicTag={publicTag}
        setPublicTag={setPublicTag}
        publicDesc={publicDesc}
        setPublicDesc={setPublicDesc}
        onClose={() => setIsPublicModalOpen(false)}
        onTogglePublic={handleTogglePublic} 
      />
    </div>
  );
};

export default Vocabulary;