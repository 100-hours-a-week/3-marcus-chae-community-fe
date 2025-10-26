/**
 * API 서비스 기본 클래스
 * 모든 API 호출의 기반이 되는 유틸리티를 제공합니다.
 */

const API_BASE_URL = '/api/v1';

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
    constructor(success, data = null, error = null, status = null) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.status = status;
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

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
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
            return new ApiResponse(false, null, errorMessage, response.status);
        }

        return new ApiResponse(true, data, null, response.status);
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
