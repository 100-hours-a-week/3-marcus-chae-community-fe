# API 및 프록시 구조

## 🔄 API 처리 흐름

### 전체 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│                    브라우저 (localhost:3000)                  │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │  1. auth.service.js                                │      │
│  │     signup({ email, password, nickname })          │      │
│  │                                                     │      │
│  │  2. api.service.js                                 │      │
│  │     post('/users', data)                           │      │
│  │     → fetch('/api/v1/users', ...)                  │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ HTTP Request
                           │ POST /api/v1/users
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              Express Server (server.js) :3000                │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │  Static File Serving                               │      │
│  │  app.use(express.static('public'))                 │      │
│  │  → HTML, CSS, JS 파일 제공                         │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │  API Proxy Middleware                              │      │
│  │  app.use('/api', createProxyMiddleware({           │      │
│  │    target: 'http://localhost:8080',                │      │
│  │    changeOrigin: true                              │      │
│  │  }))                                                │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ Proxy Forward
                           │ POST http://localhost:8080/api/v1/users
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│              백엔드 API Server :8080                          │
│                                                               │
│  ┌────────────────────────────────────────────────────┐      │
│  │  Route Handler                                     │      │
│  │  POST /api/v1/users                                │      │
│  │                                                     │      │
│  │  Business Logic:                                   │      │
│  │  - 데이터 검증                                      │      │
│  │  - 비밀번호 암호화                                  │      │
│  │  - DB 저장                                          │      │
│  │  - 토큰 생성                                        │      │
│  │                                                     │      │
│  │  Response:                                         │      │
│  │  { token: '...', user: { ... } }                   │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

## 📝 상세 설명

### 1. 클라이언트 사이드 (브라우저)

**파일 위치**: `public/js/services/`

#### api.service.js - HTTP 요청 추상화
```javascript
const API_BASE_URL = '/api/v1';  // 상대 경로!

export async function post(endpoint, data) {
    const url = `${API_BASE_URL}${endpoint}`;
    // 실제 요청: http://localhost:3000/api/v1/users
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    return new ApiResponse(response);
}
```

**역할**:
- HTTP 메서드 래핑 (GET, POST, PUT, DELETE)
- 공통 헤더 관리
- 에러 핸들링 표준화
- 응답 데이터 파싱

#### auth.service.js - 인증 API
```javascript
export async function signup(userData) {
    const response = await post('/users', userData);
    
    if (response.success) {
        // 토큰 저장
        authStorage.setToken(response.data.token);
    }
    
    return response;
}
```

**역할**:
- 인증 관련 API 호출
- 토큰 관리
- 사용자 정보 캐싱

### 2. 프록시 서버 (Express)

**파일**: `server.js`

#### 정적 파일 서빙
```javascript
app.use(express.static("public"));
```
- HTML, CSS, JS 파일 제공
- 이미지, 폰트 등 자산 제공

#### API 프록시
```javascript
app.use('/api', createProxyMiddleware({
    target: process.env.API_TARGET || 'http://localhost:8080',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[Proxy] ${req.method} ${req.path}`);
    }
}))
```

**역할**:
- `/api`로 시작하는 모든 요청을 백엔드로 전달
- CORS 문제 해결
- 요청/응답 로깅
- 에러 핸들링

## 🔍 요청 경로 변환

### 클라이언트 → Express
```
브라우저 요청: fetch('/api/v1/users')
실제 URL:     http://localhost:3000/api/v1/users
```

### Express → 백엔드
```
프록시 인식:   /api 로 시작
타겟 설정:     http://localhost:8080
최종 전달:     http://localhost:8080/api/v1/users
```

## 🌐 환경별 설정

### 개발 환경 (.env)
```bash
PORT=3000
API_TARGET=http://localhost:8080
NODE_ENV=development
```

### 프로덕션 환경
```bash
PORT=80
API_TARGET=https://api.production.com
NODE_ENV=production
```

## 🚫 CORS란? 왜 프록시가 필요할까?

### CORS (Cross-Origin Resource Sharing)

브라우저 보안 정책으로, 다른 출처(Origin)의 리소스 요청을 제한합니다.

**Origin = Protocol + Domain + Port**

```
http://localhost:3000  (프론트엔드)
  ↓ 직접 요청 시도
http://localhost:8080  (백엔드)

→ Origin이 다름! → CORS 에러 🚫
```

### 프록시 솔루션

```
http://localhost:3000  (브라우저)
  ↓ 같은 Origin 요청
http://localhost:3000/api  (프록시)
  ↓ 서버 간 통신 (CORS 제약 없음)
http://localhost:8080/api  (백엔드)

→ 브라우저는 같은 Origin → OK! ✅
```

## 🔐 프록시의 추가 이점

### 1. 보안
- 백엔드 주소 숨기기
- API 키를 서버에서 추가 가능
- 요청 필터링/검증

### 2. 유연성
- 백엔드 주소 변경 시 server.js만 수정
- 로드 밸런싱 가능
- 여러 백엔드 서버 라우팅

### 3. 개발 편의성
- 하나의 포트로 모든 서비스 접근
- CORS 설정 불필요
- 로컬 개발 환경 단순화

## 📊 실제 사용 예시

### 회원가입 플로우

```javascript
// 1. 사용자가 폼 제출
// public/js/pages/signup.page.js
async handleSignup() {
    const userData = {
        email: 'user@example.com',
        password: 'Password123!',
        nickname: '홍길동'
    };
    
    // 2. 서비스 레이어 호출
    const response = await signup(userData);
    
    if (response.success) {
        navigateTo(ROUTES.LOGIN);
    }
}

// 3. auth.service.js
export async function signup(userData) {
    return await post('/users', userData);
}

// 4. api.service.js
export async function post(endpoint, data) {
    const response = await fetch('/api/v1' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return new ApiResponse(response);
}

// 5. 브라우저
// → http://localhost:3000/api/v1/users

// 6. Express server.js (프록시)
// → http://localhost:8080/api/v1/users

// 7. 백엔드 API
// → 데이터 처리 및 응답
```

## 🛠️ 디버깅 팁

### 1. 프록시 로그 확인
```javascript
// server.js에서 이미 설정됨
onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.path}`);
}
```

### 2. 네트워크 탭 확인
- Chrome DevTools → Network
- 요청 URL 확인
- 응답 상태 코드 확인

### 3. 백엔드 연결 테스트
```bash
# 백엔드 서버가 실행 중인지 확인
curl http://localhost:8080/api/v1/health
```

## 🚀 프로덕션 배포

프로덕션 환경에서는 Nginx나 다른 리버스 프록시를 사용합니다:

```nginx
# Nginx 설정 예시
server {
    listen 80;
    
    # 정적 파일
    location / {
        root /var/www/community_fe/public;
        try_files $uri $uri/ /index.html;
    }
    
    # API 프록시
    location /api {
        proxy_pass http://backend-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
