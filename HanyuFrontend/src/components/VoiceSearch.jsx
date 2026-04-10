import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineMicrophone } from "react-icons/hi";

const VoiceSearch = ({ onSearch, onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const isStartedRef = useRef(false);
  const buttonRef = useRef(null); // Dùng để gán sự kiện thủ công

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        // Chờ một chút cho user kịp nhìn thấy chữ rồi mới search
        setTimeout(() => onSearch(transcript), 1000);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        isStartedRef.current = false;
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Lỗi Voice:", event.error);
        setIsListening(false);
        isStartedRef.current = false;
      };
    }

    // --- FIX LỖI PASSIVE EVENT Ở ĐÂY ---
    const btn = buttonRef.current;
    if (btn) {
      const handleStart = (e) => {
        if (e.cancelable) e.preventDefault(); // Chỉ ngăn chặn nếu có thể
        e.stopPropagation();
        
        if (isStartedRef.current) return;
        if (recognitionRef.current) {
          try {
            setIsListening(true);
            isStartedRef.current = true;
            recognitionRef.current.start();
          } catch (err) { console.log(err); }
        }
      };

      const handleEnd = (e) => {
        if (e.cancelable) e.preventDefault();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };

      // Gán sự kiện trực tiếp với { passive: false }
      btn.addEventListener('touchstart', handleStart, { passive: false });
      btn.addEventListener('touchend', handleEnd, { passive: false });
      btn.addEventListener('mousedown', handleStart);
      btn.addEventListener('mouseup', handleEnd);

      return () => {
        btn.removeEventListener('touchstart', handleStart);
        btn.removeEventListener('touchend', handleEnd);
        btn.removeEventListener('mousedown', handleStart);
        btn.removeEventListener('mouseup', handleEnd);
      };
    }
  }, [onSearch, onTranscript]);

  return (
    <button
      ref={buttonRef} // Gắn ref vào đây
      type="button"
      className={`p-2 transition-all duration-300 rounded-full ${
        isListening 
          ? 'text-red-500 scale-150 bg-red-50 shadow-inner' 
          : 'text-gray-400 hover:text-red-500'
      }`}
      title="Nhấn giữ để nói"
    >
      <HiOutlineMicrophone size={22} className={isListening ? "animate-pulse" : ""} />
    </button>
  );
};

export default VoiceSearch;