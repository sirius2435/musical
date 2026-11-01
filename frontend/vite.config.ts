import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({plugins:[react()],build:{minify:false},server:{host:'127.0.0.1',port:5175,proxy:{'/api':process.env.VITE_BACKEND_PROXY_TARGET || 'http://127.0.0.1:8082'}}})
