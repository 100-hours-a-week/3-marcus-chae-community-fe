/**
 * Header Web Component
 * 페이지 상단 헤더 - 로그인 상태에 따라 다른 UI 표시
 */

import authState from '../state/auth.state.js';
import { ROUTES, navigateTo } from '../utils/router.js';
import toast from '../utils/toast.js';

class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.unsubscribe = null;
    }

    connectedCallback() {
        // 인증 상태 구독
        this.unsubscribe = authState.subscribe((state) => {
            this.render(state.isLoggedIn, state.user);
        });
    }

    disconnectedCallback() {
        // 컴포넌트 제거 시 구독 해제
        if (this.unsubscribe) {
            authState.unsubscribe(this.unsubscribe);
        }
    }

    render(isLoggedIn = false, user = null) {
        const headerRightContent = !isLoggedIn
            ? '<button type="button" id="toLoginButton" class="btn btn-primary">로그인</button>'
            : `
                <span class="user-nickname">${user?.nickname || '사용자'}님</span>
                <button type="button" id="toProfileButton" class="btn btn-secondary">내 정보</button>
                <button type="button" id="logoutButton" class="btn btn-secondary">로그아웃</button>
            `;

        this.innerHTML = `
            <header class="site-header">
                <div class="header-container">
                    <div class="header-left">
                        <button type="button" id="logoButton" class="logo-button">
                            <span class="logo-text">Community</span>
                        </button>
                        <button type="button" id="toastTestButton" class="btn btn-ghost btn-sm">토스트 테스트</button>
                    </div>
                    <div class="header-right">
                        ${headerRightContent}
                    </div>
                </div>
            </header>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const logoButton = this.querySelector('#logoButton');
        const toastTestButton = this.querySelector('#toastTestButton');
        const toLoginButton = this.querySelector('#toLoginButton');
        const toProfileButton = this.querySelector('#toProfileButton');
        const logoutButton = this.querySelector('#logoutButton');

        if (logoButton) {
            logoButton.addEventListener('click', () => {
                navigateTo(ROUTES.HOME);
            });
        }

        if (toastTestButton) {
            toastTestButton.addEventListener('click', () => {
                // 여러 타입의 토스트 순차적으로 표시
                toast.success('성공! 작업이 완료되었습니다.');
                setTimeout(() => toast.error('에러! 문제가 발생했습니다.'), 500);
                setTimeout(() => toast.warning('경고! 주의가 필요합니다.'), 1000);
                setTimeout(() => toast.info('정보: 알림 메시지입니다.'), 1500);
            });
        }

        if (toLoginButton) {
            toLoginButton.addEventListener('click', () => {
                navigateTo(ROUTES.LOGIN);
            });
        }

        if (toProfileButton) {
            toProfileButton.addEventListener('click', () => {
                navigateTo(ROUTES.PROFILE);
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', async () => {
                const { logout } = await import('../services/auth.service.js');
                await logout();
                authState.logout();
                navigateTo(ROUTES.HOME);
            });
        }
    }
}

customElements.define('header-component', HeaderComponent);

export default HeaderComponent;
