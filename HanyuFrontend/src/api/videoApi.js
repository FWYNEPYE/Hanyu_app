import axios from 'axios';

const BASE_URL = 'https://localhost:5252/api'; 

const videoApi = {
  // Lấy danh sách video từ Database
  fetchVideos: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/videos`);
      return response.data; // Trả về mảng video
    } catch (error) {
      console.error("Lỗi lấy danh sách video:", error);
      throw error;
    }
  },

  // Thêm video mới
  addVideo: async (formData, onUploadProgress) => {
    try {
      const response = await axios.post(`${BASE_URL}/videos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        //upload video nặng
        onUploadProgress: onUploadProgress 
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi upload video:", error);
      throw error;
    }
  },

  // Lấy chi tiết phụ đề 
  getSubtitle: async (videoId) => {
    try {
      const response = await axios.get(`${BASE_URL}/videos/${videoId}/subtitles`);
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy phụ đề:", error);
      throw error;
    }
  }
};

export default videoApi;