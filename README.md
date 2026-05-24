# 🚀 Intelligent Chinese Learning Platform

Nền tảng học tiếng Trung thông minh tích hợp AI, hỗ trợ người dùng học tập hiệu quả thông qua việc phân tích video, tự động hóa phụ đề, hệ thống ôn tập thông minh và hỗ trợ giải đáp tức thì.

## 🛠 Tech Stack
* **Backend:** .NET 10, Web API, Entity Framework Core, JWT Authentication.
* **Frontend:** ReactJS, TailwindCSS.
* **Database:** SQLServer, Redis (Caching).
* **AI Integration:** Whisper-v3 (Xử lý phụ đề), Llama-3.3 (AI Chatbot hỗ trợ học tập).
* **DevOps:** Docker, Git.

## ✨ Các tính năng nổi bật
* **AI Subtitle Generation:** Tự động chuyển đổi âm thanh từ video sang phụ đề độ chính xác cao nhờ Whisper-v3.
* **AI Learning Assistant:** Tích hợp chatbot thông minh (Llama-3.3) hỗ trợ giải đáp ngữ pháp, giải nghĩa từ vựng và luyện tập hội thoại.
* **Spaced Repetition System (SRS):** Hệ thống ôn tập ngắt quãng tự động lên lịch nhắc nhở từ vựng dựa trên thuật toán ghi nhớ, tối ưu hóa việc ghi nhớ dài hạn cho người dùng.
* **Smart Vocabulary Management:** Tự động trích xuất từ vựng từ video vào hệ thống ôn tập cá nhân.
* **Clean Architecture:** Cấu trúc mã nguồn module hóa, chuyên nghiệp, dễ bảo trì và mở rộng.

## 📂 Cấu trúc dự án
```text
Hanyu_app/
├── HanyuBackend/
│   └── Server/          # .NET 10 Web API, Logic xử lý AI, SRS Engine
├── HanyuFrontend/       # ReactJS, UI Chatbot, Dashboard ôn tập
└── README.md

## ⚙️ Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
* .NET SDK 10.0 (hoặc phiên bản bạn đang dùng), Node.js (LTS), SQL Server, Docker.

### 2. Chạy ứng dụng
* **Backend:** `cd HanyuBackend/Server && dotnet run`
* **Frontend:** `cd HanyuFrontend && npm install && npm start`

---
*Dự án phát triển dựa trên tư duy Backend chuyên sâu, kết hợp các giải pháp AI hiện đại để giải quyết bài toán tối ưu hóa việc học ngôn ngữ.*
