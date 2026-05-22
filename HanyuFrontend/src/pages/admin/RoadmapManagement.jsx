import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  HiOutlinePlus, HiOutlineChevronRight, HiOutlineBookOpen, 
  HiOutlineAcademicCap, HiOutlineDocumentText,
  HiOutlineMap, HiOutlinePencilAlt, HiOutlineTrash
} from "react-icons/hi";
import VocabularyDrawer from '../../components/admin/VocabularyDrawer';

const RoadmapManagement = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isVocabOpen, setIsVocabOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: '', name: '', level: 1 });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // --- 1. LẤY DỮ LIỆU ---
  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/AdminRoadmap", { headers });
      setRoadmaps(res.data);
      
      // Nếu đang chọn một roadmap, cập nhật lại data mới nhất của nó (để thấy step mới)
      if (selectedRoadmap) {
        const updated = res.data.find(r => r.roadmapId === selectedRoadmap.roadmapId);
        if (updated) setSelectedRoadmap(updated);
      }
    } catch (err) {
      console.error("Lỗi lấy lộ trình:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  // --- 2. TẠO LỘ TRÌNH MỚI (Fix lỗi 400) ---
  const handleCreateRoadmap = async () => {
    const title = prompt("Nhập tên lộ trình mới:");
    if (!title) return;

    try {
      // Backend nhận Model Roadmap nên cần gửi đủ cấu trúc cơ bản
      await axios.post("/api/AdminRoadmap", { 
        title: title,
        steps: [] // Quan trọng: Tránh lỗi Validation nếu Backend yêu cầu collection
      }, { headers });
      
      fetchRoadmaps();
      alert("Tạo lộ trình thành công sếp ơi!");
    } catch (err) {
      console.error("Chi tiết lỗi:", err.response?.data);
      alert("Lỗi tạo lộ trình! Sếp check Network Tab xem Backend báo thiếu field gì nhé.");
    }
  };

  // --- 3. XÓA LỘ TRÌNH ---
  const handleDeleteRoadmap = async (id) => {
    if(!window.confirm("Sếp có chắc muốn xóa lộ trình này không?")) return;
    try {
      await axios.delete(`/api/AdminRoadmap/${id}`, { headers });
      setSelectedRoadmap(null);
      fetchRoadmaps();
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  // --- 4. THÊM CẤP ĐỘ (Khớp với [HttpPost("steps")]) ---
  const handleAddStep = async (roadmapId) => {
    const stepTitle = prompt("Nhập tên cấp độ:");
    if (!stepTitle) return;

    try {
      // Gọi đúng endpoint /api/AdminRoadmap/steps (có chữ s)
      await axios.post(`/api/AdminRoadmap/steps`, { 
        roadmapId: roadmapId,
        title: stepTitle,
        // Nếu Model RoadmapStep của sếp có thêm trường Order hay ID, hãy thêm ở đây
      }, { headers });
      
      fetchRoadmaps(); 
    } catch (err) {
      console.error("Lỗi thêm step:", err.response?.data);
      alert("Lỗi thêm cấp độ rồi!");
    }
  };

  // --- 5. XÓA CẤP ĐỘ ---
  // Lưu ý: Backend sếp chưa có xóa Step lẻ, sếp nên bổ sung [HttpDelete("steps/{id}")] ở Backend
  const handleDeleteStep = async (stepId) => {
    alert("Sếp cần viết thêm hàm DeleteStep ở Backend Controller nhé!");
  };

  //bài thi 
  // Thêm hàm xử lý gán bài thi
const handleAssignExam = async (stepId) => {
  const examId = prompt("Nhập ID bài thi sếp muốn gán cho chặng này (Xem trong Quản lý bài thi):");
  if (!examId) return;

  try {
    await axios.put(`/api/AdminRoadmap/steps/${stepId}/assign-exam`, 
      parseInt(examId), // Gửi trực tiếp số ID
      { headers: { ...headers, "Content-Type": "application/json" } }
    );
    alert("Gán bài thi xong rồi sếp!");
    fetchRoadmaps(); 
  } catch (err) {
    alert("Lỗi rồi: " + (err.response?.data || "Không tìm thấy bài thi"));
  }
};


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý Lộ trình</h2>
          <p className="text-slate-500 text-sm">Cấu trúc: Lộ trình {'>'} Cấp độ {'>'} [Từ vựng & Bài thi]</p>
        </div>
        <button onClick={handleCreateRoadmap} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
          <HiOutlinePlus /> Tạo Lộ trình mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DANH SÁCH BÊN TRÁI */}
        <div className="lg:col-span-1 space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase px-2">Danh sách lộ trình</p>
          {loading ? (
             <div className="p-4 text-slate-500 animate-pulse text-xs font-bold">ĐANG TẢI...</div>
          ) : (
            roadmaps.map(rm => (
              <div 
                key={rm.roadmapId}
                onClick={() => setSelectedRoadmap(rm)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedRoadmap?.roadmapId === rm.roadmapId 
                  ? 'bg-blue-600/10 border-blue-500' 
                  : 'bg-[#161B26] border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <HiOutlineMap className={selectedRoadmap?.roadmapId === rm.roadmapId ? 'text-blue-400' : 'text-slate-500'} />
                    <span className={`font-bold ${selectedRoadmap?.roadmapId === rm.roadmapId ? 'text-white' : 'text-slate-400'}`}>
                        {rm.title}
                    </span>
                  </div>
                  <HiOutlineChevronRight size={14} className="text-slate-600" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* CHI TIẾT BÊN PHẢI */}
        <div className="lg:col-span-2">
          {selectedRoadmap ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-bold text-white italic">Lộ trình: {selectedRoadmap.title}</h3>
                <div className="flex gap-2">
                    <button onClick={() => handleDeleteRoadmap(selectedRoadmap.roadmapId)} className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-lg">
                        <HiOutlineTrash /> Xóa Lộ trình
                    </button>
                    <button onClick={() => handleAddStep(selectedRoadmap.roadmapId)} className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg">
                        <HiOutlinePlus /> Thêm Cấp độ
                    </button>
                </div>
              </div>

              {selectedRoadmap.steps && selectedRoadmap.steps.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {selectedRoadmap.steps.map((step, index) => (
                    <div key={step.stepId} className="bg-[#161B26] border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                            <span className="text-blue-500 text-xs font-mono">#{index + 1}</span>
                            {step.title}
                          </h4>
                          <div className="flex gap-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                              <HiOutlineBookOpen size={12}/> {step.category?.categoryName || 'Chưa gán bộ từ'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                <HiOutlineAcademicCap size={12}/> 
                                {step.exam ? `Bài thi: ${step.exam.title}` : 'Chưa có bài thi'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                         <button 
                            onClick={() => {
                                setCurrentCategory({ id: step.categoryID, name: step.title, level: index + 1 });
                                setIsVocabOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-[11px] font-bold text-white transition-all"
                          >
                            <HiOutlineDocumentText size={14} /> TỪ VỰNG
                          </button>
                          
                        <button
                          onClick={() => navigate(`/admin-portal/exam-config/${step.stepId}`)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-[11px] font-bold text-white transition-all"
                        >
                          <HiOutlinePencilAlt size={14} /> 
                          QUẢN LÝ BÀI THI
                        </button>


                          
                          <button onClick={() => handleDeleteStep(step.stepId)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                            <HiOutlineTrash size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600 italic">
                  <p>Lộ trình này chưa có cấp độ nào.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-slate-800 border-dashed rounded-3xl p-10 min-h-[400px]">
              <HiOutlineMap size={48} className="mb-4 opacity-20" />
              <p>Chọn một Lộ trình ở bên trái để bắt đầu quản lý sếp nhé!</p>
            </div>
          )}
        </div>
      </div>

      <VocabularyDrawer 
        isOpen={isVocabOpen} 
        onClose={() => setIsVocabOpen(false)} 
        categoryId={currentCategory.id}
        categoryName={currentCategory.name}
        level={currentCategory.level}
      />
    </div>
  );
};

export default RoadmapManagement;