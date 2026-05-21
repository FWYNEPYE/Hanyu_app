//nút lưu từ vào bộ ở trang search
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HiX, HiOutlinePlus, HiOutlineFolder } from "react-icons/hi";

const SaveWordModal = ({ isOpen, onClose, wordData, userId, onSaved }) => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách bộ từ của user
    const fetchCategories = async () => {
        try {
            const res = await axios.get(`http://localhost:5252/api/Category/user/${userId}`);
            setCategories(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { if (isOpen) fetchCategories(); }, [isOpen]);

    // Xử lý tạo bộ từ mới rồi lưu luôn
    const handleCreateAndSave = async () => {
        if (!newCategoryName.trim()) return;
        setLoading(true);
        try {
            // 1. Tạo Category mới
            const catRes = await axios.post(`http://localhost:5252/api/Category`, {
                categoryName: newCategoryName,
                categoryType: "user",
                userID: userId
            });
            // 2. Lưu từ vào Category vừa tạo
            await handleSaveToCategory(catRes.data.categoryID);
        } catch (err) { alert("Lỗi tạo bộ từ"); }
        finally { setLoading(false); }
    };

    // Xử lý lưu vào bộ từ có sẵn
    const handleSaveToCategory = async (catId) => {
    setLoading(true);
    try {
        // Đảm bảo object gửi đi sạch sẽ và khớp với Model Vocabulary ở C#
        const payload = {
            hanzi: wordData.hanzi,
            pinyin: wordData.pinyin,
            meaning: wordData.meaning,
            type: wordData.type || "",
            radical: wordData.radical || "",
            grammar: wordData.grammar || "",
            example: wordData.example || "",
            exampleMeaning: wordData.exampleMeaning || ""
        };

        await axios.post(
            `http://localhost:5252/api/Dictionary/add-to-collection?userId=${userId}&categoryId=${catId}`, 
            payload // Gửi payload đã chuẩn hóa
        );
        
        onSaved();
        onClose();
    } catch (err) {
        // Log chi tiết lỗi từ Server trả về để biết chính xác trường nào bị sai
        console.error("Server Response Error:", err.response?.data);
        alert(typeof err.response?.data === 'string' ? err.response.data : "Lỗi khi lưu");
    } finally {
        setLoading(false);
    }
};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-gray-800">Lưu từ: <span className="text-red-500">{wordData.hanzi}</span></h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><HiX size={24} /></button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Chọn bộ từ có sẵn:</p>
                    {categories.map(cat => (
                        <button 
                            key={cat.categoryID}
                            onClick={() => handleSaveToCategory(cat.categoryID)}
                            className="w-full flex items-center gap-3 p-4 bg-slate-50 hover:bg-blue-50 border border-gray-100 rounded-2xl transition-all group"
                        >
                            <HiOutlineFolder className="text-blue-500 group-hover:scale-110 transition-transform" size={20} />
                            <span className="font-bold text-gray-700">{cat.categoryName}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                    {isCreating ? (
                        <div className="flex gap-2">
                            <input 
                                autoFocus
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-blue-400 font-medium"
                                placeholder="Tên bộ từ mới..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                            <button 
                                onClick={handleCreateAndSave}
                                className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600"
                            > {loading ? "..." : "Tạo & Lưu"} </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                            <HiOutlinePlus /> Tạo bộ từ mới
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}; export default SaveWordModal;