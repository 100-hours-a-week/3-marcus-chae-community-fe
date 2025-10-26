/**
 * 간단한 클라이언트 사이드 라우터 유틸리티
 * 페이지 이동과 라우팅을 관리합니다.
 */

/**
 * 페이지 경로 상수
 */
export const ROUTES = {
    HOME: '/', // 홈 = 인기 게시글 Top 10
    BOARD: '/board', // 게시판 = 전체 게시글 목록
    LOGIN: '/login',
    SIGNUP: '/signup',
    PROFILE: '/profile',
    POST_DETAIL: '/post-detail', // 쿼리 파라미터로 id 전달: ?id=123
    POST_CREATE: '/post-create',
    POST_EDIT: '/post-edit', // 쿼리 파라미터로 id 전달: ?id=123
};

/**
 * 페이지로 이동
 * @param {string} path - 이동할 경로
 * @param {Object} state - 전달할 상태 (optional)
 */
export function navigateTo(path, state = {}) {
    if (state && Object.keys(state).length > 0) {
        // 상태를 sessionStorage에 임시 저장
        sessionStorage.setItem('__router_state__', JSON.stringify(state));
    }
    window.location.href = path;
}

/**
 * 라우터 상태 가져오기
 * @returns {Object} 저장된 상태
 */
export function getRouterState() {
    try {
        const state = sessionStorage.getItem('__router_state__');
        sessionStorage.removeItem('__router_state__');
        return state ? JSON.parse(state) : null;
    } catch (error) {
        console.error('라우터 상태 가져오기 에러:', error);
        return null;
    }
}

/**
 * 현재 페이지 경로 가져오기
 * @returns {string} 현재 경로
 */
export function getCurrentPath() {
    return window.location.pathname;
}

/**
 * URL 쿼리 파라미터 파싱
 * @returns {Object} 쿼리 파라미터 객체
 */
export function getQueryParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);

    for (const [key, value] of searchParams) {
        params[key] = value;
    }

    return params;
}

/**
 * 쿼리 파라미터와 함께 페이지 이동
 * @param {string} path - 이동할 경로
 * @param {Object} params - 쿼리 파라미터
 */
export function navigateWithParams(path, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    window.location.href = fullPath;
}

/**
 * 뒤로 가기
 */
export function goBack() {
    window.history.back();
}

/**
 * 페이지 새로고침
 */
export function reload() {
    window.location.reload();
}

/**
 * 외부 URL인지 확인
 * @param {string} url - 확인할 URL
 * @returns {boolean}
 */
export function isExternalUrl(url) {
    try {
        const urlObj = new URL(url, window.location.origin);
        return urlObj.origin !== window.location.origin;
    } catch {
        return false;
    }
}

/**
 * 안전한 리다이렉트 (외부 URL 체크)
 * @param {string} url - 리다이렉트할 URL
 */
export function safeRedirect(url) {
    if (isExternalUrl(url)) {
        console.warn('외부 URL로의 리다이렉트 시도:', url);
        return;
    }
    window.location.href = url;
}
