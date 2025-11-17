import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3000;
const API_TARGET = process.env.API_TARGET || 'http://localhost:8080';

// API 프록시 설정
app.use(
    '/api',
    createProxyMiddleware({
        target: `${API_TARGET}/api`,
        changeOrigin: true,
    })
);

// URL Rewrite 미들웨어 - /login → /pages/login.html 형태로 변환
app.use((req, res, next) => {
    // API나 정적 리소스 경로는 건드리지 않음
    if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/pages') ||
        req.path.startsWith('/css') ||
        req.path.startsWith('/js')
    ) {
        return next();
    }

    // 루트 경로는 index.html로
    if (req.path === '/') {
        req.url = '/pages/index.html';
    } else {
        // /login → /pages/login.html
        req.url = `/pages${req.path}.html`;
    }

    next();
});

// 정적 파일 제공
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`[Server] Frontend: http://localhost:${PORT}`);
    console.log(`[Server] API Proxy: ${API_TARGET}`);
});
