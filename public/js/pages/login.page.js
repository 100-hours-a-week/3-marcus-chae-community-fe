/**
 * 로그인 페이지 컨트롤러
 * 로그인 페이지의 모든 로직을 관리합니다.
 */

import { validateEmail } from '../utils/validators.js';
import { login } from '../services/auth.service.js';
import { navigateTo, ROUTES } from '../utils/router.js';
import { authState } from '../state/auth.state.js';
import { toast } from '../utils/toast.js';
import { showInputError, hideInputError } from '../utils/form-helpers.js';

class LoginPage {
    constructor() {
        // DOM 요소
        this.elements = {};

        // 초기화
        this.init();
    }

    /**
     * 페이지 초기화
     */
    init() {
        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * 설정 및 이벤트 리스너 등록
     */
    setup() {
        // 이미 로그인된 경우 홈으로 리다이렉트
        if (authState.checkLoginStatus()) {
            navigateTo(ROUTES.HOME);
            return;
        }

        this.getElements();
        this.attachEventListeners();
    }

    /**
     * DOM 요소 가져오기
     */
    getElements() {
        // Input 요소
        this.elements.email = document.getElementById('email');
        this.elements.password = document.getElementById('password');

        // 버튼
        this.elements.loginButton = document.getElementById('loginButton');
        this.elements.toSignupButton = document.getElementById('toSignupPageButton');
    }

    /**
     * 이벤트 리스너 등록
     */
    attachEventListeners() {
        // 로그인 버튼
        this.elements.loginButton?.addEventListener('click', () => {
            this.handleLogin();
        });

        // Enter 키로 로그인
        this.elements.email?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });

        this.elements.password?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });

        // 회원가입 페이지 이동 버튼
        this.elements.toSignupButton?.addEventListener('click', () => {
            navigateTo(ROUTES.SIGNUP);
        });
    }

    /**
     * 입력 값 검증
     * @returns {boolean} 검증 성공 여부
     */
    validateInputs() {
        let isValid = true;

        // 이메일 검증
        const emailValidation = validateEmail(this.elements.email.value.trim());
        if (!emailValidation.isValid) {
            showInputError('email', emailValidation.message);
            isValid = false;
        } else {
            hideInputError('email');
        }

        // 비밀번호 검증 (입력 여부만 확인)
        if (!this.elements.password.value) {
            showInputError('password', '비밀번호를 입력해주세요.');
            isValid = false;
        } else {
            hideInputError('password');
        }

        return isValid;
    }

    /**
     * 로그인 처리
     */
    async handleLogin() {
        try {
            // 입력 값 검증
            if (!this.validateInputs()) {
                return;
            }

            // 버튼 비활성화 (중복 제출 방지)
            this.elements.loginButton.disabled = true;
            this.elements.loginButton.textContent = '로그인 중...';

            const credentials = {
                email: this.elements.email.value.trim(),
                password: this.elements.password.value,
            };

            const response = await login(credentials);

            if (response.success) {
                // AuthState 업데이트
                // response.data가 직접 사용자 정보 (userId, email, nickname)
                // 쿠키 기반 인증이므로 token 없음
                authState.login(response.data);

                toast.success('로그인되었습니다!');

                // 잠시 후 홈 페이지로 이동
                setTimeout(() => {
                    navigateTo(ROUTES.HOME);
                }, 1000);
            } else {
                toast.error(`로그인 실패: ${response.error}`);

                // 버튼 다시 활성화
                this.elements.loginButton.disabled = false;
                this.elements.loginButton.textContent = '로그인';
            }
        } catch (error) {
            console.error('로그인 에러:', error);
            toast.error('로그인 중 오류가 발생했습니다.');

            // 버튼 다시 활성화
            this.elements.loginButton.disabled = false;
            this.elements.loginButton.textContent = '로그인';
        }
    }
}

// 페이지 로드 시 자동 초기화
export default new LoginPage();
