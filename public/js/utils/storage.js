/**
 * 로컬 스토리지 관리 유틸리티
 * localStorage와 sessionStorage를 쉽게 사용할 수 있게 해줍니다.
 */

const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_INFO: 'user_info',
    LOGIN_STATUS: 'is_logged_in',
};

/**
 * localStorage에 데이터 저장
 * @param {string} key - 저장할 키
 * @param {any} value - 저장할 값 (자동으로 JSON 변환)
 */
export function setItem(key, value) {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error('localStorage setItem 에러:', error);
    }
}

/**
 * localStorage에서 데이터 가져오기
 * @param {string} key - 가져올 키
 * @returns {any} 저장된 값 (자동으로 JSON 파싱)
 */
export function getItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('localStorage getItem 에러:', error);
        return null;
    }
}

/**
 * localStorage에서 데이터 삭제
 * @param {string} key - 삭제할 키
 */
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('localStorage removeItem 에러:', error);
    }
}

/**
 * localStorage 전체 삭제
 */
export function clear() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('localStorage clear 에러:', error);
    }
}

/**
 * sessionStorage에 데이터 저장
 * @param {string} key - 저장할 키
 * @param {any} value - 저장할 값
 */
export function setSessionItem(key, value) {
    try {
        const serializedValue = JSON.stringify(value);
        sessionStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error('sessionStorage setItem 에러:', error);
    }
}

/**
 * sessionStorage에서 데이터 가져오기
 * @param {string} key - 가져올 키
 * @returns {any} 저장된 값
 */
export function getSessionItem(key) {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('sessionStorage getItem 에러:', error);
        return null;
    }
}

/**
 * sessionStorage에서 데이터 삭제
 * @param {string} key - 삭제할 키
 */
export function removeSessionItem(key) {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error('sessionStorage removeItem 에러:', error);
    }
}

// 인증 관련 헬퍼 함수들
export const authStorage = {
    setToken(token) {
        setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    },

    getToken() {
        return getItem(STORAGE_KEYS.AUTH_TOKEN);
    },

    removeToken() {
        removeItem(STORAGE_KEYS.AUTH_TOKEN);
    },

    setUserInfo(userInfo) {
        setItem(STORAGE_KEYS.USER_INFO, userInfo);
    },

    getUserInfo() {
        return getItem(STORAGE_KEYS.USER_INFO);
    },

    removeUserInfo() {
        removeItem(STORAGE_KEYS.USER_INFO);
    },

    setLoginStatus(isLoggedIn) {
        setItem(STORAGE_KEYS.LOGIN_STATUS, isLoggedIn);
    },

    getLoginStatus() {
        return getItem(STORAGE_KEYS.LOGIN_STATUS) || false;
    },

    clearAuth() {
        removeItem(STORAGE_KEYS.AUTH_TOKEN);
        removeItem(STORAGE_KEYS.USER_INFO);
        removeItem(STORAGE_KEYS.LOGIN_STATUS);
    },
};

export { STORAGE_KEYS };
