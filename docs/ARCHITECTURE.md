# 프로젝트 아키텍처

## 🏛️ 전체 구조

### 레이어 아키텍처

```
┌─────────────────────────────────────┐
│     Presentation Layer (HTML)       │  ← UI 구조
├─────────────────────────────────────┤
│   Controller Layer (Page.js)        │  ← 비즈니스 로직
├─────────────────────────────────────┤
│   Service Layer (Service.js)        │  ← API 통신
├─────────────────────────────────────┤
│   State Layer (State.js)             │  ← 상태 관리
├─────────────────────────────────────┤
│   Utility Layer (Utils.js)           │  ← 공통 기능
└─────────────────────────────────────┘
```

## 📦 모듈별 상세 설명

### 1. Components (Web Components)

**역할**: 재사용 가능한 UI 컴포넌트

**구현 방식**: Web Components API (Custom Elements)

**주요 컴포넌트**:
- `<header-component>`: 헤더 (상태 반응형)
- `<footer-component>`: 푸터
- `<input-block>`: 입력 필드 + 검증

**특징**:
- 캡슐화된 DOM 구조
- 재사용 가능
- 상태 변화에 자동 반응

### 2. Pages (Page Controllers)

**역할**: 페이지별 비즈니스 로직 관리

**패턴**: Controller Pattern

**구조**:
```javascript
class PageName {
    constructor() {
        this.validationState = {};
        this.elements = {};
        this.init();
    }
    
    init() { }
    setup() { }
    getElements() { }
    attachEventListeners() { }
    // ... 비즈니스 로직
}
```

### 3. Services (API Layer)

**역할**: API 통신 중앙화

**패턴**: Service Layer Pattern

**구조**:
- `api.service.js`: HTTP 요청 래퍼 (기본)
- `auth.service.js`: 인증 관련 API
- `post.service.js`: 게시글 관련 API (예정)

**장점**:
- API 호출 중복 제거
- 에러 핸들링 일관성
- 테스트 용이

### 4. State (State Management)

**역할**: 전역 상태 관리

**패턴**: Observer Pattern (Pub-Sub)

**동작 방식**:
```javascript
// 상태 구독
authState.subscribe((state) => {
    console.log('로그인 상태:', state.isLoggedIn);
});

// 상태 변경
authState.login(userData);

// 자동으로 모든 구독자에게 알림
```

### 5. Utils (Utility Functions)

**역할**: 재사용 가능한 헬퍼 함수

**분류**:
- `validators.js`: 입력 검증
- `storage.js`: 스토리지 관리
- `router.js`: 라우팅

## 🔄 데이터 플로우

### 회원가입 예시

```
1. 사용자 입력
   ↓
2. signup.page.js (검증)
   ↓
3. validators.js (유효성 검증)
   ↓
4. auth.service.js (API 호출)
   ↓
5. api.service.js (HTTP 요청)
   ↓
6. 백엔드 API
   ↓
7. 응답 처리
   ↓
8. authState.login() (상태 업데이트)
   ↓
9. header-component (자동 업데이트)
   ↓
10. 페이지 리다이렉트
```

## 🎯 설계 원칙

### 1. Single Responsibility Principle (SRP)
- 각 모듈은 하나의 책임만 가짐
- 변경 이유가 하나만 존재

### 2. Open-Closed Principle (OCP)
- 확장에는 열려있고 수정에는 닫혀있음
- 새로운 기능 추가 시 기존 코드 수정 최소화

### 3. Dependency Inversion Principle (DIP)
- 고수준 모듈이 저수준 모듈에 의존하지 않음
- 추상화에 의존

### 4. Don't Repeat Yourself (DRY)
- 코드 중복 최소화
- 재사용 가능한 함수/컴포넌트 활용

## 🔐 보안 고려사항

1. **XSS 방지**: 사용자 입력 검증 및 이스케이프
2. **CSRF 방지**: 토큰 기반 인증
3. **인증 토큰**: localStorage 저장 (HttpOnly Cookie 권장)
4. **민감 정보**: 환경 변수로 관리

## 📊 성능 최적화

1. **지연 로딩**: 필요한 모듈만 import
2. **코드 스플리팅**: 페이지별 번들 분리 (향후)
3. **캐싱**: API 응답 캐싱
4. **최소화**: CSS/JS 압축 (빌드 시)

## 🚀 확장 계획

1. TypeScript 도입
2. 빌드 도구 (Vite) 추가
3. 테스트 프레임워크 설정
4. CI/CD 파이프라인 구축
5. 성능 모니터링
