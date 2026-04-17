import React from 'react';
import { motion } from 'framer-motion';

const CoinFly = () => {
  // Tạo 10 hạt điểm bay cho nó rực rỡ
  const coins = Array.from({ length: 10 });

  // Tọa độ đích: Thường là góc trên bên phải, nơi đặt ô điểm ☀️
  // Mày có thể điều chỉnh lại thông số này cho khớp với UI của mày
  const targetX = window.innerWidth - 150; 
  const targetY = 30; 

  // Tọa độ bắt đầu: Giữa màn hình (nơi user bấm nhận thưởng)
  const startX = window.innerWidth / 2;
  const startY = window.innerHeight / 2;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none">
      {coins.map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ x: startX, y: startY, opacity: 1, scale: 1 }}
          animate={{
            // Bay đến đích với một chút ngẫu nhiên (random) đường bay cho đẹp
            x: targetX + (Math.random() * 40 - 20), 
            y: targetY + (Math.random() * 40 - 20),
            opacity: [1, 1, 0], // Đến gần đích thì biến mất
            scale: [1, 1.5, 0.5], // Phồng to ra rồi thu nhỏ lại khi chui vào ô điểm
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.1, // Bay lần lượt từng hạt
            ease: "easeOut"
          }}
        >
          ☀️
        </motion.div>
      ))}
    </div>
  );
};

export default CoinFly;