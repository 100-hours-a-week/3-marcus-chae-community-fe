# Community Frontend

커뮤니티 웹 애플리케이션 프론트엔드

## 📁 프로젝트 구조

```
community_fe/
├── public/
│   ├── assets/              # 정적 리소스 (이미지, 아이콘 등)
│   ├── css/
│   │   ├── design-system/   # 디자인 토큰
│   │   │   └── variables.css
│   │   ├── base/            # 기본 스타일
│   │   │   └── common.css
│   │   ├── components/      # UI 컴포넌트 스타일
│   │   │   ├── button.css
│   │   │   ├── input.css
│   │   │   ├── loading.css
│   │   │   ├── modal.css
│   │   │   ├── state.css
│   │   │   └── toast.css
│   │   └── pages/           # 페이지별 스타일
│   │       ├── home.css
│   │       ├── login.css
│   │       ├── signup.css
│   │       ├── post-detail.css
│   │       └── profile.css
│   ├── js/
│   │   ├── components/      # Web Components
│   │   │   ├── header.component.js
│   │   │   ├── footer.component.js
│   │   │   └── index.js
│   │   ├── dev/             # 개발 도구
│   │   │   └── dev-helper.js
│   │   ├── pages/           # 페이지 컨트롤러
│   │   │   ├── home.page.js
│   │   │   ├── login.page.js
│   │   │   ├── signup.page.js
│   │   │   ├── posts.page.js
│   │   │   ├── post-detail.page.js
│   │   │   └── profile.page.js
│   │   ├── services/        # API 서비스 레이어
│   │   │   ├── api.service.js
│   │   │   ├── auth.service.js
│   │   │   └── posts.service.js
│   │   ├── utils/           # 유틸리티 함수
│   │   │   ├── validators.js
│   │   │   ├── storage.js
│   │   │   ├── router.js
│   │   │   ├── toast.js
│   │   │   └── form-helpers.js
│   │   └── state/           # 상태 관리
│   │       └── auth.state.js
│   └── pages/               # HTML 페이지
│       ├── index.html       # 홈 페이지
│       ├── login.html       # 로그인
│       ├── signup.html      # 회원가입
│       ├── post-detail.html # 게시글 상세
│       └── profile.html     # 프로필
├── docs/                    # 문서
│   ├── ARCHITECTURE.md      # 아키텍처 문서
│   └── API_PROXY.md         # API 프록시 설정
├── server.js                # Express 서버
└── package.json
```

## 🏗️ 아키텍처 설계 원칙

### 1. **관심사의 분리 (Separation of Concerns)**

- **Presentation Layer**: HTML 페이지 (UI 구조만)
- **Business Logic**: 페이지 컨트롤러 (이벤트 처리, 검증 로직)
- **Data Layer**: 서비스 레이어 (API 통신)
- **State Management**: 중앙 상태 관리 (인증 상태)

### 2. **재사용성 (Reusability)**

- **Web Components**: 재사용 가능한 UI 컴포넌트
- **Utility Functions**: 공통 기능 모듈화
- **Service Layer**: API 호출 중앙화

### 3. **유지보수성 (Maintainability)**

- **명확한 디렉토리 구조**: 기능별 파일 분리
- **Single Responsibility**: 각 모듈은 하나의 책임만
- **의존성 주입**: 느슨한 결합

## 🔧 주요 모듈 설명

### Components (Web Components)

재사용 가능한 Custom Elements

- `<header-component>`: 헤더 (로그인 상태에 따라 동적 UI)
- `<footer-component>`: 푸터

### Services

API 통신을 담당하는 서비스 레이어

- `api.service.js`: 기본 HTTP 요청 래퍼
- `auth.service.js`: 인증 관련 API (회원가입, 로그인, 로그아웃)
- `posts.service.js`: 게시글 관련 API (목록 조회, 작성, 수정, 삭제)

### Utils

재사용 가능한 유틸리티 함수들

- `validators.js`: 폼 입력 검증 (이메일, 비밀번호, 닉네임 등)
- `storage.js`: localStorage/sessionStorage 관리
- `router.js`: 클라이언트 사이드 라우팅
- `toast.js`: 토스트 알림 메시지 관리
- `form-helpers.js`: 폼 처리 헬퍼 함수

### State Management

전역 상태 관리 (Observer 패턴)

- `auth.state.js`: 인증 상태 관리
    - 로그인/로그아웃 상태 추적
    - 상태 변경 시 구독자에게 알림
    - 컴포넌트 자동 업데이트

### Page Controllers

각 페이지의 비즈니스 로직을 캡슐화

- `home.page.js`: 홈 페이지 로직
- `login.page.js`: 로그인 페이지 로직
- `signup.page.js`: 회원가입 페이지 로직
- `posts.page.js`: 게시글 목록 페이지 로직
- `post-detail.page.js`: 게시글 상세 페이지 로직
- `profile.page.js`: 프로필 페이지 로직

### Development Tools

개발 편의를 위한 도구

- `dev-helper.js`: 개발 모드에서 디버깅 및 테스트를 위한 헬퍼 함수

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속

## 📝 사용 예시

### 1. 새로운 페이지 추가

**Step 1**: HTML 페이지 생성

```html
<!-- public/pages/mypage.html -->
<!DOCTYPE html>
<html lang="ko">
    <head>
        <title>마이페이지</title>
        <link rel="stylesheet" href="../css/common.css" />
    </head>
    <body>
        <header-component></header-component>
        <main>
            <!-- 페이지 컨텐츠 -->
        </main>
        <footer-component></footer-component>

        <script type="module">
            import '../js/components/index.js';
            import '../js/pages/mypage.page.js';
        </script>
    </body>
</html>
```

**Step 2**: 페이지 컨트롤러 생성

```javascript
// public/js/pages/mypage.page.js
class MyPage {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // 페이지 로직 구현
    }
}

export default new MyPage();
```

### 2. 새로운 API 서비스 추가

```javascript
// public/js/services/post.service.js
import { get, post, put, del } from './api.service.js';

export async function getPosts() {
    return await get('/posts');
}

export async function createPost(postData) {
    return await post('/posts', postData);
}

export default { getPosts, createPost };
```

### 3. 새로운 컴포넌트 추가

```javascript
// public/js/components/modal.component.js
class ModalComponent extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="modal">
                <!-- 모달 내용 -->
            </div>
        `;
    }
}

customElements.define('modal-component', ModalComponent);
export default ModalComponent;
```

## 🎨 스타일 가이드

### CSS 클래스 네이밍

- 컴포넌트: `.component-name`
- 유틸리티: `.utility-class`
- BEM 방식 권장: `.block__element--modifier`

### JavaScript 네이밍

- 클래스: `PascalCase`
- 함수/변수: `camelCase`
- 상수: `UPPER_SNAKE_CASE`
- Private 메서드: `_privateMethod`

## 🔐 인증 플로우

1. 사용자가 로그인 폼 제출
2. `login.page.js`가 입력 검증
3. `auth.service.js`가 API 호출
4. 성공 시 토큰 및 사용자 정보 저장
5. `auth.state.js`가 상태 업데이트
6. 구독 중인 모든 컴포넌트 자동 업데이트
7. 홈 페이지로 리다이렉트

## 📦 의존성

### 프로덕션

- `express`: 웹 서버
- `http-proxy-middleware`: API 프록시
- `dotenv`: 환경 변수 관리

### 개발 도구

- `eslint`: JavaScript 린터
- `prettier`: 코드 포맷터

## 🔧 개발 스크립트

```bash
# 서버 시작
npm start

# 코드 린트 검사
npm run lint

# 코드 린트 자동 수정
npm run lint:fix

# 코드 포맷팅
npm run format

# 코드 포맷팅 검사만
npm run format:check
```

## ✨ 최근 개발 내역 (2025-10-26 기준)

### 1. Design System 도입

- ✅ CSS 구조를 Atomic Design 패턴으로 재구성
- ✅ `design-system/variables.css`로 디자인 토큰 중앙화
- ✅ 컴포넌트 단위 스타일 분리 (button, input, loading, modal, state, toast)
- ✅ 페이지별 스타일 파일 분리 (home, login, signup, post-detail, profile)

### 2. 새로운 페이지 구현

- ✅ **게시글 상세 페이지** (`post-detail.html`)
    - 게시글 내용 표시
    - 댓글 기능 (작성, 수정, 삭제)
    - 수정/삭제 권한 관리
- ✅ **프로필 페이지** (`profile.html`)
    - 사용자 정보 표시
    - 프로필 편집 기능
    - 작성한 게시글 목록

### 3. 서비스 레이어 확장

- ✅ `posts.service.js` 추가
    - 게시글 CRUD API
    - 댓글 관리 API
    - 페이지네이션 지원

### 4. 유틸리티 강화

- ✅ `toast.js`: 사용자 피드백을 위한 토스트 알림 시스템
- ✅ `form-helpers.js`: 폼 처리 공통 로직 추상화

### 5. 개발 도구 추가

- ✅ `dev-helper.js`: 개발 모드 디버깅 및 테스트 지원
- ✅ Mock 데이터 생성기
- ✅ API 응답 시뮬레이션

### 6. 코드 품질 유지

- ✅ ESLint/Prettier 적용 유지
- ✅ 일관된 코드 스타일 (4칸 들여쓰기, 작은따옴표, 세미콜론)
- ✅ 시맨틱 HTML 및 ARIA 속성 준수

## 📚 주요 페이지

### 🏠 홈 페이지 (`/pages/index.html`)

- 환영 섹션 및 메인 콘텐츠
- 로그인 상태에 따라 동적 UI

### 📝 게시글 페이지

- **게시글 목록** (`/pages/posts.html` - 구현 예정)
    - 무한 스크롤링 지원
    - 게시글 카드 UI
    - 로딩/빈 상태 처리
- **게시글 상세** (`/pages/post-detail.html`)
    - 게시글 내용 표시
    - 댓글 기능
    - 수정/삭제 기능

### 👤 사용자 페이지

- **프로필** (`/pages/profile.html`)
    - 사용자 정보 표시
    - 프로필 수정
    - 작성한 게시글 목록

### 🔐 인증 페이지

- **로그인** (`/pages/login.html`)
    - 이메일/비밀번호 입력
    - 실시간 검증
- **회원가입** (`/pages/signup.html`)
    - 필수 정보 입력
    - 비밀번호 확인
    - 실시간 검증
