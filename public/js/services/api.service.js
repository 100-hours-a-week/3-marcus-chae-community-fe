/**
 * API 서비스 기본 클래스
 * 모든 API 호출의 기반이 되는 유틸리티를 제공합니다.
 */

import { authStorage } from '../utils/storage.js';
import { toast } from '../utils/toast.js';
import { navigateTo, ROUTES } from '../utils/router.js';

// 환경별 API URL 설정
// 로컬: localhost:8080으로 직접 요청
// 배포: 상대 경로 (ALB가 라우팅)
const API_BASE_URL =
    window.location.hostname === 'localhost' ? 'http://localhost:8080/api/v1' : '/api/v1';

// 리프레시 토큰 중복 방지를 위한 Promise 캐시
let refreshTokenPromise = null;

/**
 * Authorization 헤더에 JWT 토큰 추가
 * @param {Object} headers - 기존 헤더 객체
 * @returns {Object} 토큰이 추가된 헤더 객체
 */
function addAuthorizationHeader(headers = {}) {
    // authStorage는 이미 import되어 있음 (아래에서 import 추가 예정)
    const token = authStorage.getToken();

    if (token) {
        return {
            ...headers,
            Authorization: `Bearer ${token}`,
        };
    }

    return headers;
}

/**
 * 토큰 리프레시 (중복 방지 포함)
 * @returns {Promise<string|null>} 새로운 accessToken 또는 null
 */
async function refreshAccessToken() {
    // 이미 리프레시 중이면 기존 Promise 반환 (중복 방지)
    if (refreshTokenPromise) {
        return refreshTokenPromise;
    }

    refreshTokenPromise = (async () => {
        try {
            // 동적 import로 순환 참조 방지
            const { refreshToken } = await import('./auth.service.js');
            const newToken = await refreshToken();
            return newToken;
        } catch (error) {
            console.error('토큰 리프레시 실패:', error);
            return null;
        } finally {
            refreshTokenPromise = null; // 완료 후 초기화
        }
    })();

    return refreshTokenPromise;
}

/**
 * 401 에러 처리 및 자동 리프레시
 * @param {ApiResponse} response - API 응답
 * @param {Function} retryFn - 재시도할 함수
 * @returns {Promise<ApiResponse>} 처리된 응답
 */
async function handle401Error(response, retryFn) {
    const LOGIN_EXPIRED_MESSAGE = '로그인이 만료되었습니다. 다시 로그인해주세요.';

    // REFRESH_TOKEN_EXPIRED: 리프레시 토큰 만료 → 로그아웃
    if (response.errorCode === 'REFRESH_TOKEN_EXPIRED') {
        toast.error(LOGIN_EXPIRED_MESSAGE);
        authStorage.clearAuth();
        navigateTo(ROUTES.LOGIN);
        return response;
    }

    // ACCESS_TOKEN_EXPIRED: 액세스 토큰 만료 → 자동 리프레시
    if (response.errorCode === 'ACCESS_TOKEN_EXPIRED') {
        const newToken = await refreshAccessToken();

        if (newToken) {
            // 자동 갱신 성공 → 사용자 모르게 재시도
            return retryFn();
        } else {
            // 자동 갱신 실패 → 로그아웃
            toast.error(LOGIN_EXPIRED_MESSAGE);
            authStorage.clearAuth();
            navigateTo(ROUTES.LOGIN);
        }
    }

    return response;
}

/**
 * HTTP 요청 메서드
 */
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
};

/**
 * API 응답 래퍼 클래스
 */
export class ApiResponse {
    constructor(success, data = null, error = null, status = null, errorCode = null) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.status = status;
        this.errorCode = errorCode; // 백엔드의 errorCode (ACCESS_TOKEN_EXPIRED 등)
    }
}

/**
 * 기본 fetch 래퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Promise<ApiResponse>}
 */
async function request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    // Authorization 헤더 자동 추가
    const headers = addAuthorizationHeader({
        'Content-Type': 'application/json',
        ...options.headers,
    });

    const defaultOptions = {
        headers,
        credentials: 'include', // Refresh Token 쿠키 전송용
        ...options,
    };

    try {
        const response = await fetch(url, defaultOptions);

        // 응답 본문이 있는 경우에만 JSON 파싱 시도
        let data = null;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else if (response.status !== 204) {
            // 204 No Content가 아닌 경우
            const text = await response.text();
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = text;
                }
            }
        }

        if (!response.ok) {
            const errorMessage = data?.message || data?.error || `HTTP ${response.status} 에러`;
            const errorCode = data?.errorCode || null; // 백엔드의 errorCode 추출
            const apiResponse = new ApiResponse(false, null, errorMessage, response.status, errorCode);

            // 401 에러 처리: 자동 리프레시 시도
            if (response.status === 401) {
                return handle401Error(apiResponse, () => request(endpoint, options));
            }

            return apiResponse;
        }

        return new ApiResponse(true, data, null, response.status, null);
    } catch (error) {
        console.error('API 요청 에러:', error);
        return new ApiResponse(false, null, error.message || '네트워크 에러가 발생했습니다.', null);
    }
}

/**
 * GET 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} params - 쿼리 파라미터
 * @returns {Promise<ApiResponse>}
 */
export async function get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return request(url, {
        method: HTTP_METHODS.GET,
    });
}

/**
 * POST 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 본문
 * @returns {Promise<ApiResponse>}
 */
export async function post(endpoint, data = {}) {
    return request(endpoint, {
        method: HTTP_METHODS.POST,
        body: JSON.stringify(data),
    });
}

/**
 * PUT 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 본문
 * @returns {Promise<ApiResponse>}
 */
export async function put(endpoint, data = {}) {
    return request(endpoint, {
        method: HTTP_METHODS.PUT,
        body: JSON.stringify(data),
    });
}

/**
 * PATCH 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} data - 요청 본문
 * @returns {Promise<ApiResponse>}
 */
export async function patch(endpoint, data = {}) {
    return request(endpoint, {
        method: HTTP_METHODS.PATCH,
        body: JSON.stringify(data),
    });
}

/**
 * DELETE 요청
 * @param {string} endpoint - API 엔드포인트
 * @returns {Promise<ApiResponse>}
 */
export async function del(endpoint) {
    return request(endpoint, {
        method: HTTP_METHODS.DELETE,
    });
}

/**
 * FormData를 사용한 POST 요청 (파일 업로드용)
 * @param {string} endpoint - API 엔드포인트
 * @param {FormData} formData - FormData 객체
 * @returns {Promise<ApiResponse>}
 */
export async function postFormData(endpoint, formData) {
    return request(endpoint, {
        method: HTTP_METHODS.POST,
        body: formData,
        headers: {}, // FormData는 자동으로 Content-Type 설정됨
    });
}

/**
 * 인증 토큰을 포함한 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @param {string} token - 인증 토큰
 * @returns {Promise<ApiResponse>}
 */
export async function authenticatedRequest(endpoint, options = {}, token) {
    return request(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    });
}

export default {
    get,
    post,
    put,
    patch,
    delete: del,
    postFormData,
    authenticatedRequest,
};
