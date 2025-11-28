/**
 * 게시글 작성/수정 페이지 컨트롤러
 * 게시글 작성 및 수정 페이지의 모든 로직을 관리합니다.
 */

import { validatePostTitle, validatePostContent } from '../utils/validators.js';
import { createPost, getPostById, updatePost } from '../services/posts.service.js';
import { navigateTo, ROUTES } from '../utils/router.js';
import { toast } from '../utils/toast.js';
import modal from '../utils/modal.js';
import { showInputError, hideInputError } from '../utils/form-helpers.js';

class PostFormPage {
    constructor() {
        // 작성/수정 모드
        this.mode = 'create'; // 'create' or 'edit'
        this.postId = null;

        // 유효성 상태
        this.validationState = {
            title: false,
            content: false,
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
    async setup() {
        this.getElements();
        this.checkMode();
        this.attachEventListeners();
        this.updateSubmitButtonState();

        // 수정 모드인 경우 게시글 데이터 로드
        if (this.mode === 'edit' && this.postId) {
            await this.loadPostData();
        }
    }

    /**
     * 작성/수정 모드 확인
     */
    checkMode() {
        const urlParams = new URLSearchParams(window.location.search);
        this.postId = urlParams.get('id');

        if (this.postId) {
            this.mode = 'edit';
            this.updatePageTitle('게시글 수정');
            this.elements.submitButton.textContent = '수정';
        } else {
            this.mode = 'create';
            this.updatePageTitle('게시글 작성');
            this.elements.submitButton.textContent = '작성';
        }
    }

    /**
     * 페이지 제목 업데이트
     */
    updatePageTitle(title) {
        const titleElement = document.getElementById('post-form-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
        document.title = title;
    }

    /**
     * 게시글 데이터 로드 (수정 모드)
     */
    async loadPostData() {
        try {
            const response = await getPostById(this.postId);

            if (!response.success) {
                toast.error('게시글을 불러오는데 실패했습니다.');
                navigateTo(ROUTES.HOME);
                return;
            }

            const post = response.data;

            // 폼에 데이터 채우기
            this.elements.title.value = post.title;
            this.elements.content.value = post.content;

            // 글자 수 업데이트
            this.updateCharCount('title', post.title.length);
            this.updateCharCount('content', post.content.length);

            // 유효성 검증
            this.validateTitleField(false);
            this.validateContentField(false);
        } catch (error) {
            console.error('게시글 로드 실패:', error);
            toast.error('게시글을 불러오는데 실패했습니다.');
            navigateTo(ROUTES.HOME);
        }
    }

    /**
     * DOM 요소 가져오기
     */
    getElements() {
        // Input 요소
        this.elements.title = document.getElementById('title');
        this.elements.content = document.getElementById('content');

        // 글자 수 표시
        this.elements.titleCount = document.getElementById('titleCount');
        this.elements.contentCount = document.getElementById('contentCount');

        // 버튼
        this.elements.submitButton = document.getElementById('submitButton');
        this.elements.cancelButton = document.getElementById('cancelButton');
    }

    /**
     * 이벤트 리스너 등록
     */
    attachEventListeners() {
        // 제목 검증 및 글자 수 카운트
        this.elements.title?.addEventListener('input', (e) => {
            this.validateTitleField(false);
            this.updateCharCount('title', e.target.value.length);
        });
        this.elements.title?.addEventListener('focusout', () => {
            this.validateTitleField(true);
        });

        // 내용 검증 및 글자 수 카운트
        this.elements.content?.addEventListener('input', (e) => {
            this.validateContentField(false);
            this.updateCharCount('content', e.target.value.length);
        });
        this.elements.content?.addEventListener('focusout', () => {
            this.validateContentField(true);
        });

        // 제출 버튼
        this.elements.submitButton?.addEventListener('click', () => {
            this.handleSubmit();
        });

        // 취소 버튼
        this.elements.cancelButton?.addEventListener('click', () => {
            this.handleCancel();
        });

        // Enter 키로 폼 제출 방지 (제목 필드)
        this.elements.title?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.elements.content?.focus();
            }
        });
    }

    /**
     * 제목 검증
     */
    validateTitleField(showError) {
        const title = this.elements.title.value;
        const validation = validatePostTitle(title);

        this.validationState.title = validation.isValid;

        if (showError && !validation.isValid) {
            showInputError(this.elements.title, validation.message);
        } else if (validation.isValid) {
            hideInputError(this.elements.title);
        }

        this.updateSubmitButtonState();
        return validation.isValid;
    }

    /**
     * 내용 검증
     */
    validateContentField(showError) {
        const content = this.elements.content.value;
        const validation = validatePostContent(content);

        this.validationState.content = validation.isValid;

        if (showError && !validation.isValid) {
            showInputError(this.elements.content, validation.message);
        } else if (validation.isValid) {
            hideInputError(this.elements.content);
        }

        this.updateSubmitButtonState();
        return validation.isValid;
    }

    /**
     * 글자 수 업데이트
     */
    updateCharCount(field, count) {
        if (field === 'title') {
            this.elements.titleCount.textContent = count;
        } else if (field === 'content') {
            this.elements.contentCount.textContent = count;
        }
    }

    /**
     * 제출 버튼 상태 업데이트
     */
    updateSubmitButtonState() {
        const isValid = this.validationState.title && this.validationState.content;
        this.elements.submitButton.disabled = !isValid;
    }

    /**
     * 폼 제출 처리
     */
    async handleSubmit() {
        // 모든 필드 검증
        const isTitleValid = this.validateTitleField(true);
        const isContentValid = this.validateContentField(true);

        if (!isTitleValid || !isContentValid) {
            toast.error('입력 내용을 확인해주세요.');
            return;
        }

        const title = this.elements.title.value.trim();
        const content = this.elements.content.value.trim();

        // 버튼 비활성화 (중복 제출 방지)
        this.elements.submitButton.disabled = true;
        this.elements.submitButton.textContent =
            this.mode === 'create' ? '작성 중...' : '수정 중...';

        try {
            let response;

            if (this.mode === 'create') {
                response = await createPost(title, content);
            } else {
                response = await updatePost(this.postId, title, content);
            }

            if (response.success) {
                toast.success(
                    this.mode === 'create' ? '게시글이 작성되었습니다.' : '게시글이 수정되었습니다.'
                );

                // 게시글 상세 페이지로 이동
                const postId = this.mode === 'create' ? response.data.id : this.postId;
                navigateTo(`/pages/post-detail.html?id=${postId}`);
            } else {
                toast.error(response.error || '게시글 저장에 실패했습니다.');
                this.elements.submitButton.disabled = false;
                this.elements.submitButton.textContent = this.mode === 'create' ? '작성' : '수정';
            }
        } catch (error) {
            console.error('게시글 저장 실패:', error);
            toast.error('게시글 저장에 실패했습니다.');
            this.elements.submitButton.disabled = false;
            this.elements.submitButton.textContent = this.mode === 'create' ? '작성' : '수정';
        }
    }

    /**
     * 취소 처리
     */
    async handleCancel() {
        // 내용이 입력되어 있으면 확인
        const hasContent = this.elements.title.value.trim() || this.elements.content.value.trim();

        if (hasContent) {
            const confirmed = await modal.confirm({
                title: '작성 취소',
                message: '작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?',
                variant: 'warning',
                confirmText: '취소',
                cancelText: '계속 작성',
            });

            if (!confirmed) {
                return;
            }
        }

        // 이전 페이지로 이동
        if (this.mode === 'edit' && this.postId) {
            navigateTo(`/pages/post-detail.html?id=${this.postId}`);
        } else {
            navigateTo(ROUTES.HOME);
        }
    }
}

export default new PostFormPage();
