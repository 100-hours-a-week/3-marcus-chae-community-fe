/**
 * Header Web Component
 * 페이지 상단 헤더 - 로그인 상태에 따라 다른 UI 표시
 */

import { authState } from '../state/auth.state.js';
import { ROUTES, navigateTo } from '../utils/router.js';

class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.authCallback = null;
    }

    connectedCallback() {
        // 초기 렌더링 (한 번만)
        this.renderInitial();

        // 콜백 함수를 저장하여 구독/해제에 사용
        this.authCallback = (state) => {
            // 전체 재렌더링 대신 auth UI만 업데이트
            this.updateAuthUI(state.isLoggedIn, state.user);
        };

        // 인증 상태 구독
        authState.subscribe(this.authCallback);
    }

    disconnectedCallback() {
        // 컴포넌트 제거 시 구독 해제
        if (this.authCallback) {
            authState.unsubscribe(this.authCallback);
        }
    }

    /**
     * 초기 렌더링 (한 번만 실행)
     */
    renderInitial() {
        const { isLoggedIn, user } = authState.getState();

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
                    </div>
                    <div class="header-right" id="headerRight">
                        ${headerRightContent}
                    </div>
                </div>
            </header>
        `;

        // 이벤트 리스너는 한 번만 등록 (로고 버튼은 항상 있음)
        this.attachStaticEventListeners();
        // auth 관련 버튼은 동적으로 등록
        this.attachAuthEventListeners();
    }

    /**
     * 인증 상태 변경 시 auth UI만 업데이트 (부분 업데이트)
     */
    updateAuthUI(isLoggedIn, user) {
        const headerRight = this.querySelector('#headerRight');
        if (!headerRight) return;

        const headerRightContent = !isLoggedIn
            ? '<button type="button" id="toLoginButton" class="btn btn-primary">로그인</button>'
            : `
                <span class="user-nickname">${user?.nickname || '사용자'}님</span>
                <button type="button" id="toProfileButton" class="btn btn-secondary">내 정보</button>
                <button type="button" id="logoutButton" class="btn btn-secondary">로그아웃</button>
            `;

        // header-right 영역만 업데이트
        headerRight.innerHTML = headerRightContent;

        // auth 관련 버튼 이벤트만 재등록
        this.attachAuthEventListeners();
    }

    /**
     * 정적 이벤트 리스너 (한 번만 등록)
     */
    attachStaticEventListeners() {
        const logoButton = this.querySelector('#logoButton');

        if (logoButton) {
            logoButton.addEventListener('click', () => {
                navigateTo(ROUTES.HOME);
            });
        }
    }

    /**
     * 동적 이벤트 리스너 (auth UI 변경 시 재등록)
     */
    attachAuthEventListeners() {
        const toLoginButton = this.querySelector('#toLoginButton');
        const toProfileButton = this.querySelector('#toProfileButton');
        const logoutButton = this.querySelector('#logoutButton');

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
