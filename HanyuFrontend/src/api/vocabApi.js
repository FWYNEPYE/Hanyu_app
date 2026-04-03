import axios from 'axios';

const API_BASE_URL = 'http://localhost:5252/api'; 

const vocabApi = {
  // Hàm lấy từ vựng theo bộ lọc
  getFilteredVocab: async (category, limit) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Vocabulary/filter`, {
        // Chỉ gửi category và limit lên Server
        params: { category, limit  }
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi gọi API nè:", error);
      return [];
    }
  }};

  //hàm lấy toàn bộ cho trang Admin 
//   getAllVocab: async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/Vocabulary`);
//       return response.data;
//     } catch (error) {
//       return [];
//     }
//   }
// };

export default vocabApi;