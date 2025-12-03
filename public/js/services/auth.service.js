/**
 * 인증 관련 API 서비스
 * JWT 기반 인증 (Access Token + Refresh Token)
 * - Access Token: localStorage 저장, Authorization 헤더로 전송
 * - Refresh Token: HttpOnly 쿠키 (자동 관리)
 */

import { post, get, patch, del } from './api.service.js';
import { authStorage } from '../utils/storage.js';

/**
 * 회원가입
 * @param {Object} userData - 사용자 정보
 * @param {string} userData.email - 이메일
 * @param {string} userData.password - 비밀번호
 * @param {string} userData.nickname - 닉네임
 * @returns {Promise<ApiResponse>}
 */
export async function signup(userData) {
    const response = await post('/users', {
        email: userData.email,
        password: userData.password,
        nickname: userData.nickname,
    });

    if (!response.success) {
        console.error('회원가입 실패:', response.error);

        if (response.status === 409) {
            response.error = '이미 가입된 이메일입니다.';
        }
    }

    return response;
}

/**
 * 로그인
 * @param {Object} credentials - 로그인 정보
 * @param {string} credentials.email - 이메일
 * @param {string} credentials.password - 비밀번호
 * @returns {Promise<ApiResponse>}
 */
export async function login(credentials) {
    const response = await post('/auth', {
        email: credentials.email,
        password: credentials.password,
    });

    if (response.success && response.data) {
        authStorage.setToken(response.data.accessToken);
        authStorage.setUserInfo(response.data.myProfileResponse);
        authStorage.setLoginStatus(true);

        return {
            success: true,
            data: response.data.myProfileResponse,
        };
    } else {
        console.error('로그인 실패:', response.error);
    }

    return response;
}

/**
 * 로그아웃
 * @returns {Promise<ApiResponse>}
 */
export async function logout() {
    const response = await del('/auth');
    authStorage.clearAuth();
    return response;
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 * @returns {Promise<ApiResponse>}
 */
export async function getCurrentUser() {
    const response = await get('/users/me');

    if (response.success && response.data) {
        authStorage.setUserInfo(response.data);
    }

    return response;
}

/**
 * 비밀번호 변경
 * @param {Object} passwordData - 비밀번호 정보
 * @param {string} passwordData.originalPassword - 현재 비밀번호
 * @param {string} passwordData.newPassword - 새 비밀번호
 * @returns {Promise<ApiResponse>}
 */
export async function changePassword(passwordData) {
    const response = await patch('/users/me/password', {
        originalPassword: passwordData.originalPassword,
        newPassword: passwordData.newPassword,
    });

    if (!response.success) {
        console.error('비밀번호 변경 실패:', response.error);
    }

    return response;
}

/**
 * 회원 탈퇴
 * @returns {Promise<ApiResponse>}
 */
export async function deleteAccount() {
    const response = await del('/users');

    if (response.success) {
        authStorage.clearAuth();
    } else {
        console.error('회원 탈퇴 실패:', response.error);
    }

    return response;
}

/**
 * 닉네임 변경
 * @param {string} nickname - 새 닉네임
 * @returns {Promise<ApiResponse>}
 */
export async function updateNickname(nickname) {
    const response = await patch('/users/me/nickname', {
        nickname: nickname,
    });

    if (response.success && response.data) {
        authStorage.setUserInfo(response.data);
    } else {
        console.error('닉네임 변경 실패:', response.error);
    }

    return response;
}

/**
 * 이메일 중복 확인
 * @param {string} email - 확인할 이메일
 * @returns {Promise<ApiResponse>}
 */
export async function checkEmailDuplicate(email) {
    const response = await get('/users/check-email', { email });
    return response;
}

/**
 * 닉네임 중복 확인
 * @param {string} nickname - 확인할 닉네임
 * @returns {Promise<ApiResponse>}
 */
export async function checkNicknameDuplicate(nickname) {
    const response = await get('/users/check-nickname', { nickname });
    return response;
}

/**
 * 로그인 상태 확인
 * @returns {boolean}
 */
export function isLoggedIn() {
    const token = authStorage.getToken();
    const loginStatus = authStorage.getLoginStatus();
    const userInfo = authStorage.getUserInfo();
    return !!(token && loginStatus && userInfo);
}

/**
 * 토큰 리프레시
 * @returns {Promise<string|null>} 새로운 accessToken 또는 null
 */
export async function refreshToken() {
    const response = await get('/auth/refresh');

    if (response.success && response.data) {
        authStorage.setToken(response.data.accessToken);
        return response.data.accessToken;
    }

    return null;
}

export default {
    signup,
    login,
    logout,
    getCurrentUser,
    changePassword,
    updateNickname,
    deleteAccount,
    checkEmailDuplicate,
    checkNicknameDuplicate,
    isLoggedIn,
    refreshToken,
};
