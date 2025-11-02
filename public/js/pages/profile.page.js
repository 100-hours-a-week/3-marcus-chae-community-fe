/**
 * 프로필 페이지 컨트롤러
 * 사용자 프로필 정보 조회 및 수정을 관리합니다.
 */

import { validatePassword, validateNickname } from '../utils/validators.js';
import { showInputError, hideInputError } from '../utils/form-helpers.js';
import { getCurrentUser, updateNickname, changePassword } from '../services/auth.service.js';
import toast from '../utils/toast.js';
import { authState } from '../state/auth.state.js';
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
        const state = authState.getState();
        if (!state.isLoggedIn) {
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

            // 실제 API 호출
            const response = await getCurrentUser();

            if (!response.success) {
                toast.error(response.error || '프로필 정보를 불러오는데 실패했습니다.');
                this.hideLoading();
                return;
            }

            this.displayProfileData(response.data);
            this.hideLoading();
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

        // createdAt이 있으면 표시, 없으면 숨김
        if (data.createdAt && this.elements.profileCreatedAt) {
            this.elements.profileCreatedAt.textContent = this.formatDate(data.createdAt);
        } else if (this.elements.profileCreatedAt) {
            this.elements.profileCreatedAt.textContent = '-';
        }

        // 수정 폼에 현재 값 설정 (닉네임만 수정 가능)
        this.elements.editNickname.value = data.nickname || '';

        // 이메일은 읽기 전용으로 설정
        if (this.elements.editEmail) {
            this.elements.editEmail.value = data.email || '';
            this.elements.editEmail.disabled = true;
        }
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
        // 닉네임 검증만 수행 (이메일은 수정 불가)
        const nickname = this.elements.editNickname.value.trim();
        const validation = validateNickname(nickname);

        if (!validation.isValid) {
            showInputError(this.elements.editNickname, validation.message);
            return false;
        } else {
            hideInputError(this.elements.editNickname);
            return true;
        }
    }

    /**
     * 비밀번호 변경 입력 값 검증
     * @returns {boolean} 검증 성공 여부
     */
    validatePasswordChange() {
        let isValid = true;

        // 현재 비밀번호 검증
        if (!this.elements.currentPassword.value) {
            showInputError(this.elements.currentPassword, '현재 비밀번호를 입력해주세요.');
            isValid = false;
        } else {
            hideInputError(this.elements.currentPassword);
        }

        // 새 비밀번호 검증
        const newPasswordValidation = validatePassword(this.elements.newPassword.value);
        if (!newPasswordValidation.isValid) {
            showInputError(this.elements.newPassword, newPasswordValidation.message);
            isValid = false;
        } else {
            hideInputError(this.elements.newPassword);
        }

        // 비밀번호 확인 검증
        if (this.elements.newPassword.value !== this.elements.confirmPassword.value) {
            showInputError(this.elements.confirmPassword, '새 비밀번호가 일치하지 않습니다.');
            isValid = false;
        } else {
            hideInputError(this.elements.confirmPassword);
        }

        return isValid;
    }

    /**
     * 프로필 수정 처리 (닉네임만 수정)
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

            const nickname = this.elements.editNickname.value.trim();

            // 실제 API 호출
            const response = await updateNickname(nickname);

            if (response.success) {
                toast.success('닉네임이 수정되었습니다.');

                // authState 업데이트 (response.data에 MyProfileResponse가 있음)
                authState.updateUser(response.data);

                // 화면 업데이트
                this.displayProfileData(response.data);
            } else {
                toast.error(response.error || '닉네임 수정에 실패했습니다.');
            }

            // 버튼 다시 활성화
            this.elements.profileEditBtn.disabled = false;
            this.elements.profileEditBtn.textContent = '닉네임 수정';
        } catch (error) {
            console.error('닉네임 수정 에러:', error);
            toast.error('닉네임 수정 중 오류가 발생했습니다.');

            // 버튼 다시 활성화
            this.elements.profileEditBtn.disabled = false;
            this.elements.profileEditBtn.textContent = '닉네임 수정';
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
                originalPassword: this.elements.currentPassword.value,
                newPassword: this.elements.newPassword.value,
            };

            // 실제 API 호출
            const response = await changePassword(passwordData);

            if (response.success) {
                toast.success('비밀번호가 변경되었습니다.');
                this.elements.passwordChangeForm.reset();
            } else {
                toast.error(response.error || '비밀번호 변경에 실패했습니다.');
            }

            // 버튼 다시 활성화
            this.elements.passwordChangeBtn.disabled = false;
            this.elements.passwordChangeBtn.textContent = '비밀번호 변경';
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
