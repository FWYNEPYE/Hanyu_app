import React from 'react';
import { motion } from 'framer-motion';

const CoinFly = () => {
  // Tạo 10 hạt điểm bay 
  const coins = Array.from({ length: 10 });

  const targetX = window.innerWidth - 150; 
  const targetY = 30; 

  const startX = window.innerWidth * 0.75;
const startY = window.innerHeight * 0.5;

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none">
      {coins.map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ x: startX, y: startY, opacity: 1, scale: 1 }}
          animate={{
            x: targetX + (Math.random() * 40 - 20), 
            y: targetY + (Math.random() * 40 - 20),
          }}
          transition={{
            duration: 1.2,
            delay: i * 0.1, 
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