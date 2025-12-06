/**
 * 에러 처리 유틸리티
 * API 에러를 사용자 친화적인 메시지로 변환하고, 인라인 에러 표시를 관리합니다.
 */

/**
 * 에러 메시지가 기술적인 패턴인지 확인
 * @param {string} message - 에러 메시지
 * @returns {boolean} 기술적 메시지 여부
 */
function isTechnicalError(message) {
    if (!message || typeof message !== 'string') return false;

    // "HTTP 404 에러", "HTTP 500 에러" 등의 패턴
    const technicalPatterns = [
        /^HTTP \d{3} 에러$/i,
        /^HTTP error/i,
        /^\d{3} error$/i,
        /^error \d{3}$/i,
    ];

    return technicalPatterns.some((pattern) => pattern.test(message.trim()));
}

/**
 * API 에러 메시지 추출 및 가공
 * @param {ApiResponse} response - API 응답 객체
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string} 사용자 친화적 메시지
 */
export function getErrorMessage(response, defaultMessage = '오류가 발생했습니다.') {
    // 네트워크 에러 (status가 없는 경우)
    if (!response.status) {
        return '네트워크 연결을 확인해주세요.';
    }

    // 백엔드 에러 메시지가 있으면서 기술적이지 않은 경우 그대로 사용
    if (response.error && typeof response.error === 'string' && !isTechnicalError(response.error)) {
        return response.error;
    }

    // 기술적 에러이거나 에러 메시지가 없으면 기본 메시지
    return defaultMessage;
}

/**
 * 맥락 기반 에러 메시지 매핑
 * HTTP 상태 코드와 사용자 행동을 조합하여 상황에 맞는 메시지 생성
 */
const CONTEXTUAL_ERROR_MAP = {
    // 404 에러 - 리소스를 찾을 수 없음
    404: {
        로그인: '이메일 또는 비밀번호가 일치하지 않습니다.',
        '게시글 불러오기': '게시글을 찾을 수 없습니다. 삭제되었거나 존재하지 않을 수 있습니다.',
        '게시글 삭제': '게시글을 찾을 수 없습니다.',
        '게시글 수정': '게시글을 찾을 수 없습니다.',
        '댓글 작성': '게시글을 찾을 수 없습니다.',
        '댓글 수정': '댓글을 찾을 수 없습니다.',
        '댓글 삭제': '댓글을 찾을 수 없습니다.',
        '프로필 불러오기': '사용자 정보를 찾을 수 없습니다.',
        default: '요청한 정보를 찾을 수 없습니다.',
    },
    // 401 에러 - 인증 필요
    401: {
        로그인: '이메일 또는 비밀번호가 일치하지 않습니다.',
        default: '로그인이 필요합니다.',
    },
    // 403 에러 - 권한 없음
    403: {
        '게시글 삭제': '작성자만 게시글을 삭제할 수 있습니다.',
        '게시글 수정': '작성자만 게시글을 수정할 수 있습니다.',
        '댓글 수정': '작성자만 댓글을 수정할 수 있습니다.',
        '댓글 삭제': '작성자만 댓글을 삭제할 수 있습니다.',
        default: '이 작업을 수행할 권한이 없습니다.',
    },
    // 409 에러 - 충돌 (중복)
    409: {
        회원가입: '이미 사용 중인 이메일 또는 닉네임입니다.',
        '닉네임 수정': '이미 사용 중인 닉네임입니다.',
        default: '이미 존재하는 정보입니다.',
    },
    // 400 에러 - 잘못된 요청
    400: {
        로그인: '이메일과 비밀번호를 확인해주세요.',
        회원가입: '입력 내용을 확인해주세요.',
        '게시글 작성': '제목과 내용을 확인해주세요.',
        '게시글 수정': '제목과 내용을 확인해주세요.',
        '비밀번호 변경': '현재 비밀번호가 일치하지 않습니다.',
        default: '입력 내용을 확인해주세요.',
    },
    // 500 에러 - 서버 오류
    500: {
        default: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    },
};

/**
 * 맥락을 추가한 에러 메시지 생성
 * @param {ApiResponse} response - API 응답 객체
 * @param {string} action - 수행하려던 작업 (예: '로그인', '게시글 작성')
 * @returns {string} 맥락이 추가된 메시지
 */
export function getContextualErrorMessage(response, action) {
    // 네트워크 에러
    if (!response.status) {
        return `${action} 중 네트워크 오류가 발생했습니다.`;
    }

    // 백엔드가 명확한 메시지를 준 경우 (기술적 에러가 아닌 경우)
    if (response.error && typeof response.error === 'string' && !isTechnicalError(response.error)) {
        return response.error;
    }

    // HTTP 상태 코드 기반 맥락 메시지 매핑
    const statusMap = CONTEXTUAL_ERROR_MAP[response.status];
    if (statusMap) {
        // 특정 action에 대한 메시지가 있으면 사용
        if (statusMap[action]) {
            return statusMap[action];
        }
        // 없으면 기본 메시지 사용
        return statusMap.default;
    }

    // 매핑되지 않은 에러는 일반적인 메시지
    return `${action} 중 오류가 발생했습니다.`;
}

/**
 * 입력 요소에 인라인 에러 표시
 * @param {HTMLElement} inputElement - 입력 요소
 * @param {string} message - 에러 메시지
 */
export function showInputError(inputElement, message) {
    inputElement.classList.add('error');

    // 에러 메시지 요소 찾기 또는 생성
    let errorElement = inputElement.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }

    errorElement.textContent = message;
}

/**
 * 입력 요소의 인라인 에러 제거
 * @param {HTMLElement} inputElement - 입력 요소
 */
export function hideInputError(inputElement) {
    inputElement.classList.remove('error');

    const errorElement = inputElement.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = '';
    }
}
