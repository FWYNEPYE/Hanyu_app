// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),
//     tailwindcss(),
//   ],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5252',
//         changeOrigin: true,
//         secure: false,
//       }
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // Chỉ cần để link backend thật của bạn vào đây
        target: 'https://hanyuapp-production.up.railway.app', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})