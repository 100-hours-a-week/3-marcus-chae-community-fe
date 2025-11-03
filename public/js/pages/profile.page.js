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

        // 닉네임 인라인 편집
        this.elements.nicknameDisplayMode = document.getElementById('nicknameDisplayMode');
        this.elements.nicknameEditMode = document.getElementById('nicknameEditForm');
        this.elements.nicknameEditBtn = document.getElementById('nicknameEditBtn');
        this.elements.nicknameCancelBtn = document.getElementById('nicknameCancelBtn');
        this.elements.editNickname = document.getElementById('editNickname');

        // 비밀번호 변경 폼
        this.elements.passwordChangeToggle = document.getElementById('passwordChangeToggle');
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
        // 닉네임 편집 버튼
        this.elements.nicknameEditBtn?.addEventListener('click', () => {
            this.showNicknameEditMode();
        });

        // 닉네임 취소 버튼
        this.elements.nicknameCancelBtn?.addEventListener('click', () => {
            this.hideNicknameEditMode();
        });

        // 닉네임 수정 폼
        this.elements.nicknameEditMode?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNicknameEdit();
        });

        // 비밀번호 변경 토글 버튼
        const passwordToggleBtn = document.getElementById('passwordChangeToggleBtn');
        if (passwordToggleBtn) {
            passwordToggleBtn.addEventListener('click', () => this.togglePasswordChangeForm());
        }

        // 비밀번호 변경 취소 버튼
        const passwordCancelBtn = document.getElementById('passwordChangeCancelBtn');
        if (passwordCancelBtn) {
            passwordCancelBtn.addEventListener('click', () => this.cancelPasswordChange());
        }

        // 비밀번호 변경 폼
        this.elements.passwordChangeForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordChange();
        });
    }

    /**
     * 닉네임 편집 모드 표시
     */
    showNicknameEditMode() {
        if (this.elements.nicknameDisplayMode && this.elements.nicknameEditMode) {
            this.elements.nicknameDisplayMode.classList.add('hidden');
            this.elements.nicknameEditMode.classList.remove('hidden');

            // 현재 닉네임 값으로 입력 필드 채우기
            const currentNickname = this.elements.profileNickname.textContent;
            if (currentNickname && currentNickname !== '-') {
                this.elements.editNickname.value = currentNickname;
            }

            // 포커스
            this.elements.editNickname.focus();
            this.elements.editNickname.select();
        }
    }

    /**
     * 닉네임 편집 모드 숨김
     */
    hideNicknameEditMode() {
        if (this.elements.nicknameDisplayMode && this.elements.nicknameEditMode) {
            this.elements.nicknameEditMode.classList.add('hidden');
            this.elements.nicknameDisplayMode.classList.remove('hidden');

            // 에러 메시지 초기화
            hideInputError(this.elements.editNickname);
        }
    }

    /**
     * 비밀번호 변경 폼 토글
     */
    togglePasswordChangeForm() {
        const form = this.elements.passwordChangeForm;

        if (form) {
            const isHidden = form.classList.contains('hidden');

            if (isHidden) {
                // 폼 표시
                form.classList.remove('hidden');
                this.elements.passwordChangeToggle?.classList.add('expanded');

                // 포커스
                const currentPasswordInput = document.getElementById('currentPassword');
                if (currentPasswordInput) {
                    currentPasswordInput.focus();
                }
            } else {
                // 폼 숨김
                this.cancelPasswordChange();
            }
        }
    }

    /**
     * 비밀번호 변경 취소
     */
    cancelPasswordChange() {
        const form = this.elements.passwordChangeForm;

        if (form) {
            form.classList.add('hidden');
            this.elements.passwordChangeToggle?.classList.remove('expanded');

            // 폼 리셋
            form.reset();

            // 에러 메시지 초기화
            const errors = ['currentPasswordError', 'newPasswordError', 'confirmPasswordError'];
            errors.forEach((errorId) => {
                const errorEl = document.getElementById(errorId);
                if (errorEl) {
                    errorEl.textContent = '';
                }
            });
        }
    }

    /**
     * 닉네임 입력 값 검증
     * @returns {boolean} 검증 성공 여부
     */
    validateNicknameEdit() {
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
     * 닉네임 수정 처리
     */
    async handleNicknameEdit() {
        try {
            // 입력 값 검증
            if (!this.validateNicknameEdit()) {
                return;
            }

            const nickname = this.elements.editNickname.value.trim();

            // 실제 API 호출
            const response = await updateNickname(nickname);

            if (response.success) {
                toast.success('닉네임이 수정되었습니다.');

                // authState 업데이트 (response.data에 MyProfileResponse가 있음)
                authState.updateUser(response.data);

                // 화면 업데이트
                this.displayProfileData(response.data);

                // 편집 모드 종료
                this.hideNicknameEditMode();
            } else {
                toast.error(response.error || '닉네임 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('닉네임 수정 에러:', error);
            toast.error('닉네임 수정 중 오류가 발생했습니다.');
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
                this.cancelPasswordChange();
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
