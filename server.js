import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// URL Rewrite 미들웨어 - /login → /pages/login.html 형태로 변환
app.use((req, res, next) => {
    // 정적 리소스 경로는 건드리지 않음
    if (
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
    /* eslint-disable no-console */
    console.log(`[Server] Frontend: http://localhost:${PORT}`);
    /* eslint-enable no-console */
});
