/**
 * 개발 헬퍼 유틸리티
 * 개발 중 테스트를 위한 자동 입력 기능을 제공합니다.
 *
 * ⚠️ 프로덕션 배포 시 이 파일의 import를 제거하세요!
 */

class DevHelper {
    constructor() {
        this.testData = {
            login: {
                email: 'test@example.com',
                password: 'Test1234!',
            },
            signup: {
                email: 'test@example.com',
                password: 'Test1234!',
                passwordConfirm: 'Test1234!',
                nickname: '테스트유저',
            },
        };

        this.init();
    }

    /**
     * 초기화
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * 설정
     */
    setup() {
        // 현재 페이지 타입 감지
        const pageType = this.detectPageType();

        if (pageType) {
            this.addQuickFillButton(pageType);
        }
    }

    /**
     * 페이지 타입 감지
     * URL Rewrite를 고려하여 /login과 /pages/login.html 모두 지원
     * @returns {string|null} 'login' | 'signup' | null
     */
    detectPageType() {
        const path = window.location.pathname;

        // URL Rewrite 고려: /login, /pages/login.html 모두 지원
        if (path.includes('login')) {
            return 'login';
        }
        if (path.includes('signup')) {
            return 'signup';
        }

        return null;
    }

    /**
     * 빠른 입력 버튼 추가
     * @param {string} pageType - 페이지 타입
     */
    addQuickFillButton(pageType) {
        // 버튼 컨테이너 찾기
        const form = document.querySelector('form');
        if (!form) {
            return;
        }

        // 제출 버튼 찾기
        const submitButtonId = pageType === 'login' ? 'loginButton' : 'signupButton';
        const submitButton = document.getElementById(submitButtonId);

        if (!submitButton) {
            return;
        }

        // 버튼 생성
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-secondary btn-block';
        button.textContent = '🚀 DEV: 빠른 입력';
        button.style.marginTop = 'var(--spacing-3)';
        button.style.opacity = '0.7';

        // 클릭 이벤트
        button.addEventListener('click', () => {
            this.fillForm(pageType);
        });

        // 제출 버튼 바로 다음에 추가
        submitButton.insertAdjacentElement('afterend', button);
    }

    /**
     * 폼 자동 입력
     * @param {string} pageType - 페이지 타입
     */
    fillForm(pageType) {
        const data = this.testData[pageType];

        if (!data) {
            return;
        }

        // 각 필드에 값 설정
        Object.keys(data).forEach((key) => {
            const input = document.getElementById(key);
            if (input) {
                input.value = data[key];

                // input 이벤트 트리거 (검증 로직 등을 위해)
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        // 잠시 후 자동 제출 (사용자가 입력 확인 가능하도록)
        setTimeout(() => {
            this.autoSubmit(pageType);
        }, 300);
    }

    /**
     * 자동 제출
     * @param {string} pageType - 페이지 타입
     */
    autoSubmit(pageType) {
        let submitButton;

        if (pageType === 'login') {
            submitButton = document.getElementById('loginButton');
        } else if (pageType === 'signup') {
            submitButton = document.getElementById('signupButton');
        }

        if (submitButton) {
            submitButton.click();
        }
    }
}

// 자동 초기화
new DevHelper();

export default DevHelper;
