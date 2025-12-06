/**
 * 회원가입 페이지 컨트롤러
 * 회원가입 페이지의 모든 로직을 관리합니다.
 */

import {
    validateEmail,
    validatePassword,
    validatePasswordConfirm,
    validateNickname,
} from '../utils/validators.js';
import { signup } from '../services/auth.service.js';
import { navigateTo, ROUTES } from '../utils/router.js';
import { toast } from '../utils/toast.js';
import { showInputError, hideInputError } from '../utils/form-helpers.js';
import { getErrorMessage } from '../utils/error-handler.js';

class SignupPage {
    constructor() {
        // 유효성 상태
        this.validationState = {
            email: false,
            password: false,
            passwordConfirm: false,
            nickname: false,
        };

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
        this.getElements();
        this.attachEventListeners();
        this.updateSignupButtonState();
    }

    /**
     * DOM 요소 가져오기
     */
    getElements() {
        // Input 요소
        this.elements.email = document.getElementById('email');
        this.elements.password = document.getElementById('password');
        this.elements.passwordConfirm = document.getElementById('passwordConfirm');
        this.elements.nickname = document.getElementById('nickname');

        // 버튼
        this.elements.signupButton = document.getElementById('signupButton');
        this.elements.toLoginButton = document.getElementById('toLoginPageButton');
    }

    /**
     * 이벤트 리스너 등록
     */
    attachEventListeners() {
        // 이메일 검증 (input: 버튼 활성화용, focusout: 에러 표시용)
        this.elements.email?.addEventListener('input', () => {
            this.validateEmailField(false); // 에러 메시지 표시 안 함
        });
        this.elements.email?.addEventListener('focusout', () => {
            this.validateEmailField(true); // 에러 메시지 표시
        });

        // 비밀번호 검증
        this.elements.password?.addEventListener('input', () => {
            this.validatePasswordField(false);
        });
        this.elements.password?.addEventListener('focusout', () => {
            this.validatePasswordField(true);
        });

        // 비밀번호 확인 검증
        this.elements.passwordConfirm?.addEventListener('input', () => {
            this.validatePasswordConfirmField(false);
        });
        this.elements.passwordConfirm?.addEventListener('focusout', () => {
            this.validatePasswordConfirmField(true);
        });

        // 닉네임 검증
        this.elements.nickname?.addEventListener('input', () => {
            this.validateNicknameField(false);
        });
        this.elements.nickname?.addEventListener('focusout', () => {
            this.validateNicknameField(true);
        });

        // 회원가입 버튼
        this.elements.signupButton?.addEventListener('click', () => {
            this.handleSignup();
        });

        // 로그인 페이지 이동 버튼
        this.elements.toLoginButton?.addEventListener('click', () => {
            navigateTo(ROUTES.LOGIN);
        });
    }

    /**
     * 이메일 필드 검증
     * @param {boolean} showError - 에러 메시지 표시 여부
     */
    validateEmailField(showError = true) {
        const email = this.elements.email.value.trim();
        this.elements.email.value = email;

        const validation = validateEmail(email);
        this.validationState.email = validation.isValid;

        if (showError) {
            if (!validation.isValid) {
                showInputError('email', validation.message);
            } else {
                hideInputError('email');
            }
        }

        this.updateSignupButtonState();
    }

    /**
     * 비밀번호 필드 검증
     * @param {boolean} showError - 에러 메시지 표시 여부
     */
    validatePasswordField(showError = true) {
        const password = this.elements.password.value;
        const validation = validatePassword(password);

        this.validationState.password = validation.isValid;

        if (showError) {
            if (!validation.isValid) {
                showInputError('password', validation.message);
            } else {
                hideInputError('password');
            }
        }

        // 비밀번호 확인도 다시 검증 (입력 중일 때는 에러 표시 안 함)
        if (this.elements.passwordConfirm.value) {
            this.validatePasswordConfirmField(showError);
        }

        this.updateSignupButtonState();
    }

    /**
     * 비밀번호 확인 필드 검증
     * @param {boolean} showError - 에러 메시지 표시 여부
     */
    validatePasswordConfirmField(showError = true) {
        if (!this.validationState.password) {
            return;
        }

        const password = this.elements.password.value;
        const passwordConfirm = this.elements.passwordConfirm.value;

        const validation = validatePasswordConfirm(password, passwordConfirm);
        this.validationState.passwordConfirm = validation.isValid;

        if (showError) {
            if (!validation.isValid) {
                showInputError('passwordConfirm', validation.message);
            } else {
                hideInputError('passwordConfirm');
            }
        }

        this.updateSignupButtonState();
    }

    /**
     * 닉네임 필드 검증
     * @param {boolean} showError - 에러 메시지 표시 여부
     */
    validateNicknameField(showError = true) {
        const nickname = this.elements.nickname.value;
        const validation = validateNickname(nickname);

        this.validationState.nickname = validation.isValid;

        if (showError) {
            if (!validation.isValid) {
                showInputError('nickname', validation.message);
            } else {
                hideInputError('nickname');
            }
        }

        this.updateSignupButtonState();
    }

    /**
     * 회원가입 버튼 상태 업데이트
     */
    updateSignupButtonState() {
        const allValid = Object.values(this.validationState).every((v) => v === true);

        if (this.elements.signupButton) {
            this.elements.signupButton.disabled = !allValid;
        }
    }

    /**
     * 회원가입 처리
     */
    async handleSignup() {
        try {
            // 버튼 비활성화 (중복 제출 방지)
            this.elements.signupButton.disabled = true;
            this.elements.signupButton.textContent = '처리 중...';

            const userData = {
                email: this.elements.email.value.trim(),
                password: this.elements.password.value,
                nickname: this.elements.nickname.value.trim(),
            };

            const response = await signup(userData);

            if (response.success) {
                toast.success('회원가입이 완료되었습니다!');

                // 잠시 후 로그인 페이지로 이동
                setTimeout(() => {
                    navigateTo(ROUTES.LOGIN);
                }, 1500);
            } else {
                const errorMessage = getErrorMessage(
                    response,
                    '회원가입에 실패했습니다. 입력 내용을 확인해주세요.'
                );
                toast.error(errorMessage);

                // 버튼 다시 활성화
                this.elements.signupButton.disabled = false;
                this.elements.signupButton.textContent = '회원가입';
            }
        } catch (error) {
            console.error('회원가입 에러:', error);
            toast.error('회원가입 중 네트워크 오류가 발생했습니다.');

            // 버튼 다시 활성화
            this.elements.signupButton.disabled = false;
            this.elements.signupButton.textContent = '회원가입';
        }
    }
}

// 페이지 로드 시 자동 초기화
export default new SignupPage();
