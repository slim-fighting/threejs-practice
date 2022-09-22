import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        proxy: {
            // 字符串简写写法
            '/foo': 'http://localhost:4567',
            // 选项写法
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
        }
    }
})

