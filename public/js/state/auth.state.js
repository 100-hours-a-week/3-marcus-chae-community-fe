/**
 * 인증 상태 관리
 * Observer 패턴을 사용하여 로그인 상태 변화를 구독하고 알림받을 수 있습니다.
 */

import { authStorage } from '../utils/storage.js';
import { isLoggedIn } from '../services/auth.service.js';

/**
 * AuthState 클래스 - 싱글톤 패턴
 */
class AuthState {
    constructor() {
        if (AuthState.instance) {
            return AuthState.instance;
        }

        this.isLoggedIn = false;
        this.user = null;
        this.observers = [];

        // 초기 상태 로드
        this.loadState();

        AuthState.instance = this;
    }

    /**
     * 로컬 스토리지에서 상태 로드
     */
    loadState() {
        this.isLoggedIn = isLoggedIn();
        this.user = authStorage.getUserInfo();
    }

    /**
     * 옵저버 등록
     * @param {Function} observer - 상태 변화 시 호출될 콜백 함수
     */
    subscribe(observer) {
        if (typeof observer !== 'function') {
            console.error('Observer는 함수여야 합니다.');
            return;
        }
        this.observers.push(observer);

        // 즉시 현재 상태 전달
        observer(this.getState());
    }

    /**
     * 옵저버 제거
     * @param {Function} observer - 제거할 옵저버
     */
    unsubscribe(observer) {
        this.observers = this.observers.filter((obs) => obs !== observer);
    }

    /**
     * 모든 옵저버에게 알림
     */
    notify() {
        const state = this.getState();
        this.observers.forEach((observer) => {
            try {
                observer(state);
            } catch (error) {
                console.error('옵저버 실행 에러:', error);
            }
        });
    }

    /**
     * 현재 상태 가져오기
     * @returns {Object} 현재 인증 상태
     */
    getState() {
        return {
            isLoggedIn: this.isLoggedIn,
            user: this.user,
        };
    }

    /**
     * 로그인 처리
     * @param {Object} userData - 사용자 정보
     * @param {string} token - 인증 토큰 (optional)
     */
    login(userData, token = null) {
        this.isLoggedIn = true;
        this.user = userData;

        // 스토리지에 저장
        authStorage.setUserInfo(userData);
        authStorage.setLoginStatus(true);
        if (token) {
            authStorage.setToken(token);
        }

        // 옵저버들에게 알림
        this.notify();
    }

    /**
     * 로그아웃 처리
     */
    logout() {
        this.isLoggedIn = false;
        this.user = null;

        // 스토리지 정리
        authStorage.clearAuth();

        // 옵저버들에게 알림
        this.notify();
    }

    /**
     * 사용자 정보 업데이트
     * @param {Object} userData - 업데이트할 사용자 정보
     */
    updateUser(userData) {
        this.user = { ...this.user, ...userData };
        authStorage.setUserInfo(this.user);
        this.notify();
    }

    /**
     * 로그인 여부 확인
     * @returns {boolean}
     */
    checkLoginStatus() {
        return this.isLoggedIn;
    }

    /**
     * 현재 사용자 정보 가져오기
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.user;
    }
}

// 싱글톤 인스턴스 생성 및 export
const authState = new AuthState();

export default authState;

// 편의 함수들
export const subscribe = (observer) => authState.subscribe(observer);
export const unsubscribe = (observer) => authState.unsubscribe(observer);
export const login = (userData, token) => authState.login(userData, token);
export const logout = () => authState.logout();
export const updateUser = (userData) => authState.updateUser(userData);
export const getAuthState = () => authState.getState();
export const isUserLoggedIn = () => authState.checkLoginStatus();
export const getCurrentUser = () => authState.getCurrentUser();
