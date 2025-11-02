/**
 * 인증 관련 API 서비스
 * 회원가입, 로그인, 로그아웃 등의 인증 기능을 제공합니다.
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
        // 쿠키 기반 인증이므로 사용자 정보만 저장
        // response.data가 직접 사용자 정보 (userId, email, nickname)
        authStorage.setUserInfo(response.data);
        authStorage.setLoginStatus(true);
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

    // 로컬 스토리지 정리
    authStorage.clearAuth();

    return response;
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 * @returns {Promise<ApiResponse>}
 */
export async function getCurrentUser() {
    // 쿠키 기반 인증이므로 토큰 체크 불필요
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
        // 로컬 스토리지 정리
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
    // 쿠키 기반 인증이므로 token 체크 불필요
    const loginStatus = authStorage.getLoginStatus();
    const userInfo = authStorage.getUserInfo();
    return !!(loginStatus && userInfo);
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
};
