# Community FE

## 백엔드 API 연결 설정

백엔드 API 목적지는 다음 파일들에서 설정됩니다:

### 1. 환경 변수 (`API_TARGET`)
- **server.js:6** - 기본값: `http://localhost:8080`
- 환경 변수로 오버라이드 가능: `API_TARGET=http://api.example.com`

### 2. 프록시 설정
- **server.js:9-15** - `/api`로 시작하는 요청을 백엔드로 프록시
- `API_TARGET` 환경 변수를 사용해 타겟 서버 지정

### 3. 클라이언트 API 베이스 경로
- **public/js/services/api.service.js:6** - `API_BASE_URL = '/api/v1'`
- 모든 API 요청의 기본 경로 (상대 경로)

## 실행 방법

```bash
# 기본 실행 (백엔드: localhost:8080)
npm start

# 다른 백엔드 서버 지정
API_TARGET=http://api.example.com npm start
```