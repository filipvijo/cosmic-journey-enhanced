import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: { // Add this section
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  server: {
    port: 4002, // Frontend runs on port 4002
    proxy: {
      '/api': { // Requests starting with /api
        target: 'http://localhost:3001', // Will be forwarded to backend on port 3001
        changeOrigin: true, // Necessary for virtual hosted sites
        secure: false,      // Set to true if backend uses HTTPS with valid cert
        ws: true,           // Enable WebSocket proxying if needed
        configure: (proxy, _options) => {
          // Logging added for debugging proxy requests/responses/errors
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to Backend:', req.method, req.url); // Modified log
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from Backend:', proxyRes.statusCode, req.url); // Modified log
          });
        },
      },
    },
  },
})
