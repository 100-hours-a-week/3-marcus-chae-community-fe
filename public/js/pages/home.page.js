/**
 * 홈 페이지 컨트롤러
 * 환영 섹션 및 로그인 상태에 따른 UI 관리
 */

import authState from '../state/auth.state.js';
import { ROUTES } from '../utils/router.js';

class HomePage {
    constructor() {
        this.elements = {};
        this.init();
    }

    /**
     * 페이지 초기화
     */
    init() {
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
        this.setupAuthStateSubscription();
        this.attachEventListeners();
    }

    /**
     * DOM 요소 가져오기
     */
    getElements() {
        this.elements.welcomeActions = document.getElementById('welcomeActions');
        this.elements.createPostBtn = document.getElementById('createPostBtn');
        this.elements.emptyCreateBtn = document.getElementById('emptyCreateBtn');
    }

    /**
     * 인증 상태 구독 설정
     */
    setupAuthStateSubscription() {
        // 로그인 상태에 따른 UI 업데이트
        authState.subscribe((state) => {
            this.updateUIByAuthState(state);
        });
    }

    /**
     * 인증 상태에 따른 UI 업데이트
     * @param {Object} state - 인증 상태
     */
    updateUIByAuthState(state) {
        if (state.isLoggedIn) {
            // 로그인 상태: 게시글 작성 버튼만 표시
            this.elements.welcomeActions.innerHTML = '';
            if (this.elements.createPostBtn) {
                this.elements.createPostBtn.style.display = 'block';
            }
            if (this.elements.emptyCreateBtn) {
                this.elements.emptyCreateBtn.style.display = 'block';
            }
        } else {
            // 비로그인 상태: 로그인/회원가입 버튼 표시
            this.renderGuestButtons();
            if (this.elements.createPostBtn) {
                this.elements.createPostBtn.style.display = 'none';
            }
            if (this.elements.emptyCreateBtn) {
                this.elements.emptyCreateBtn.style.display = 'none';
            }
        }
    }

    /**
     * 비로그인 사용자를 위한 버튼 렌더링
     */
    renderGuestButtons() {
        this.elements.welcomeActions.innerHTML = `
            <button class="btn btn-primary" id="welcomeLoginBtn">로그인</button>
            <button class="btn btn-secondary" id="welcomeSignupBtn">회원가입</button>
        `;

        // 동적 생성된 버튼에 이벤트 리스너 추가
        const welcomeLoginBtn = document.getElementById('welcomeLoginBtn');
        const welcomeSignupBtn = document.getElementById('welcomeSignupBtn');

        if (welcomeLoginBtn) {
            welcomeLoginBtn.addEventListener('click', () => {
                location.href = ROUTES.LOGIN;
            });
        }

        if (welcomeSignupBtn) {
            welcomeSignupBtn.addEventListener('click', () => {
                location.href = ROUTES.SIGNUP;
            });
        }
    }

    /**
     * 이벤트 리스너 등록
     */
    attachEventListeners() {
        // 게시글 작성 버튼 이벤트
        this.elements.createPostBtn?.addEventListener('click', () => {
            this.handleCreatePost();
        });

        this.elements.emptyCreateBtn?.addEventListener('click', () => {
            this.handleCreatePost();
        });
    }

    /**
     * 게시글 작성 처리
     */
    handleCreatePost() {
        // TODO: 게시글 작성 페이지로 이동
        alert('게시글 작성 페이지로 이동 (구현 예정)');
    }
}

// 페이지 로드 시 자동 초기화
export default new HomePage();
