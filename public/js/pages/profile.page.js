/**
 * 프로필 페이지 컨트롤러
 * 사용자 프로필 정보 조회 및 수정을 관리합니다.
 */

import { validateEmail, validatePassword } from '../utils/validators.js';
import { showInputError, hideInputError } from '../utils/form-helpers.js';
import toast from '../utils/toast.js';
import authState from '../state/auth.state.js';
import { navigateTo, ROUTES } from '../utils/router.js';

class ProfilePage {
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
        // 로그인 확인
        if (!authState.checkLoginStatus()) {
            toast.error('로그인이 필요합니다.');
            navigateTo(ROUTES.LOGIN);
            return;
        }

        this.getElements();
        this.loadProfileData();
        this.attachEventListeners();
    }

    /**
     * DOM 요소 가져오기
     */
    getElements() {
        // 로딩 및 콘텐츠
        this.elements.loadingIndicator = document.getElementById('loadingIndicator');
        this.elements.profileContent = document.getElementById('profileContent');

        // 프로필 정보 표시
        this.elements.profileNickname = document.getElementById('profileNickname');
        this.elements.profileEmail = document.getElementById('profileEmail');
        this.elements.profileCreatedAt = document.getElementById('profileCreatedAt');

        // 프로필 수정 폼
        this.elements.profileEditForm = document.getElementById('profileEditForm');
        this.elements.editNickname = document.getElementById('editNickname');
        this.elements.editEmail = document.getElementById('editEmail');
        this.elements.profileEditBtn = document.getElementById('profileEditBtn');

        // 비밀번호 변경 폼
        this.elements.passwordChangeForm = document.getElementById('passwordChangeForm');
        this.elements.currentPassword = document.getElementById('currentPassword');
        this.elements.newPassword = document.getElementById('newPassword');
        this.elements.confirmPassword = document.getElementById('confirmPassword');
        this.elements.passwordChangeBtn = document.getElementById('passwordChangeBtn');
    }

    /**
     * 프로필 데이터 로드
     */
    async loadProfileData() {
        try {
            // 로딩 표시
            this.showLoading();

            // TODO: 실제 API 호출은 나중에 구현
            // const response = await getCurrentUser();

            // 더미 데이터로 표시
            setTimeout(() => {
                const dummyData = {
                    nickname: '테스트유저',
                    email: 'test@example.com',
                    createdAt: '2025-01-15',
                };

                this.displayProfileData(dummyData);
                this.hideLoading();
            }, 500);
        } catch (error) {
            console.error('프로필 로드 에러:', error);
            toast.error('프로필 정보를 불러오는데 실패했습니다.');
            this.hideLoading();
        }
    }

    /**
     * 프로필 데이터 화면에 표시
     * @param {Object} data - 사용자 프로필 데이터
     */
    displayProfileData(data) {
        // 프로필 정보 표시
        this.elements.profileNickname.textContent = data.nickname || '-';
        this.elements.profileEmail.textContent = data.email || '-';
        this.elements.profileCreatedAt.textContent = this.formatDate(data.createdAt) || '-';

        // 수정 폼에 현재 값 설정
        this.elements.editNickname.value = data.nickname || '';
        this.elements.editEmail.value = data.email || '';
    }

    /**
     * 날짜 포맷팅
     * @param {string} dateString - 날짜 문자열
     * @returns {string} 포맷된 날짜
     */
    formatDate(dateString) {
        if (!dateString) {
            return '';
        }
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    /**
     * 로딩 표시
     */
    showLoading() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'block';
        }
        if (this.elements.profileContent) {
            this.elements.profileContent.style.display = 'none';
        }
    }

    /**
     * 로딩 숨김
     */
    hideLoading() {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = 'none';
        }
        if (this.elements.profileContent) {
            this.elements.profileContent.style.display = 'block';
        }
    }

    /**
     * 이벤트 리스너 등록
     */
    attachEventListeners() {
        // 프로필 수정 폼
        this.elements.profileEditForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileEdit();
        });

        // 비밀번호 변경 폼
        this.elements.passwordChangeForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordChange();
        });
    }

    /**
     * 프로필 수정 입력 값 검증
     * @returns {boolean} 검증 성공 여부
     */
    validateProfileEdit() {
        let isValid = true;

        // 닉네임 검증
        const nickname = this.elements.editNickname.value.trim();
        if (!nickname) {
            showInputError('editNickname', '닉네임을 입력해주세요.');
            isValid = false;
        } else if (nickname.length < 2 || nickname.length > 20) {
            showInputError('editNickname', '닉네임은 2자 이상 20자 이하로 입력해주세요.');
            isValid = false;
        } else {
            hideInputError('editNickname');
        }

        // 이메일 검증
        const emailValidation = validateEmail(this.elements.editEmail.value.trim());
        if (!emailValidation.isValid) {
            showInputError('editEmail', emailValidation.message);
            isValid = false;
        } else {
            hideInputError('editEmail');
        }

        return isValid;
    }

    /**
     * 비밀번호 변경 입력 값 검증
     * @returns {boolean} 검증 성공 여부
     */
    validatePasswordChange() {
        let isValid = true;

        // 현재 비밀번호 검증
        if (!this.elements.currentPassword.value) {
            showInputError('currentPassword', '현재 비밀번호를 입력해주세요.');
            isValid = false;
        } else {
            hideInputError('currentPassword');
        }

        // 새 비밀번호 검증
        const newPasswordValidation = validatePassword(this.elements.newPassword.value);
        if (!newPasswordValidation.isValid) {
            showInputError('newPassword', newPasswordValidation.message);
            isValid = false;
        } else {
            hideInputError('newPassword');
        }

        // 비밀번호 확인 검증
        if (this.elements.newPassword.value !== this.elements.confirmPassword.value) {
            showInputError('confirmPassword', '새 비밀번호가 일치하지 않습니다.');
            isValid = false;
        } else {
            hideInputError('confirmPassword');
        }

        return isValid;
    }

    /**
     * 프로필 수정 처리
     */
    async handleProfileEdit() {
        try {
            // 입력 값 검증
            if (!this.validateProfileEdit()) {
                return;
            }

            // 버튼 비활성화
            this.elements.profileEditBtn.disabled = true;
            this.elements.profileEditBtn.textContent = '수정 중...';

            const profileData = {
                nickname: this.elements.editNickname.value.trim(),
                email: this.elements.editEmail.value.trim(),
            };

            // TODO: 실제 API 호출은 나중에 구현
            // const response = await updateProfile(profileData);

            // 더미 응답
            setTimeout(() => {
                toast.success('프로필이 수정되었습니다.');
                this.displayProfileData(profileData);

                // 버튼 다시 활성화
                this.elements.profileEditBtn.disabled = false;
                this.elements.profileEditBtn.textContent = '프로필 수정';
            }, 1000);
        } catch (error) {
            console.error('프로필 수정 에러:', error);
            toast.error('프로필 수정 중 오류가 발생했습니다.');

            // 버튼 다시 활성화
            this.elements.profileEditBtn.disabled = false;
            this.elements.profileEditBtn.textContent = '프로필 수정';
        }
    }

    /**
     * 비밀번호 변경 처리
     */
    async handlePasswordChange() {
        try {
            // 입력 값 검증
            if (!this.validatePasswordChange()) {
                return;
            }

            // 버튼 비활성화
            this.elements.passwordChangeBtn.disabled = true;
            this.elements.passwordChangeBtn.textContent = '변경 중...';

            const passwordData = {
                currentPassword: this.elements.currentPassword.value,
                newPassword: this.elements.newPassword.value,
            };

            // TODO: 실제 API 호출은 나중에 구현
            // const response = await changePassword(passwordData);

            // 더미 응답
            setTimeout(() => {
                toast.success('비밀번호가 변경되었습니다.');
                this.elements.passwordChangeForm.reset();

                // 버튼 다시 활성화
                this.elements.passwordChangeBtn.disabled = false;
                this.elements.passwordChangeBtn.textContent = '비밀번호 변경';
            }, 1000);
        } catch (error) {
            console.error('비밀번호 변경 에러:', error);
            toast.error('비밀번호 변경 중 오류가 발생했습니다.');

            // 버튼 다시 활성화
            this.elements.passwordChangeBtn.disabled = false;
            this.elements.passwordChangeBtn.textContent = '비밀번호 변경';
        }
    }
}

// 페이지 로드 시 자동 초기화
export default new ProfilePage();
