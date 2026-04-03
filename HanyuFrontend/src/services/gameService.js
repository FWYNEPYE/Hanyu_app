// src/services/gameService.js
// thay urd sau này
const BASE_URL = "https://api.example.com/api"; 

export const gameService = {
  // Lấy danh sách câu hỏi tổng hợp
  getMixedQuestions: async () => {
    // Tạm thời trả về dữ liệu mẫu (Mock Data)
    return [
      { id: 1, type: 'MCQ', question: '你好', options: ['Chào bạn', 'Cảm ơn', 'Tạm biệt', 'Xin lỗi'], answer: 'Chào bạn' },
      { id: 2, type: 'TYPE', question: 'Học tập', answer: '学习', pinyin: 'xuexi' },
      { id: 3, type: 'LISTENING', question: '老师', options: ['Bác sĩ', 'Giáo viên', 'Kỹ sư', 'Học sinh'], answer: 'Giáo viên' },
    ];
    
    // dùng cho backend
    // const response = await fetch(`${BASE_URL}/questions/mixed`);
    // return await response.json();
  },

  // Gửi điểm lên bảng xếp hạng
  submitScore: async (userData) => {
    console.log("Đang gửi điểm lên server...", userData);
    return { success: true };
    
    // Backend code:
    // return await axios.post(`${BASE_URL}/leaderboard`, userData);
  },

  // Lấy danh sách bảng xếp hạng
  getLeaderboard: async () => {
    return [
      { name: "User 1", score: 1000, isMe: false },
      { name: "Mày nè", score: 850, isMe: true },
      { name: "User 3", score: 500, isMe: false },
    ];
  }
};