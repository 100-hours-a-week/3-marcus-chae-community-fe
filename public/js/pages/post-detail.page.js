/**
 * 게시글 상세보기 페이지
 */

import { getQueryParams, navigateTo, ROUTES } from '../utils/router.js';
import { getPostById, deletePost } from '../services/posts.service.js';
import { createComment, updateComment, deleteComment } from '../services/comments.service.js';
import { authState } from '../state/auth.state.js';
import { toast } from '../utils/toast.js';
import modal from '../utils/modal.js';
import { validateCommentContent } from '../utils/validators.js';
import {
    getContextualErrorMessage,
    showInputError,
    hideInputError,
} from '../utils/error-handler.js';

// ==================== 상태 관리 ====================
let postId = null;
let currentPost = null;

// DOM 요소
const loadingIndicator = document.getElementById('loadingIndicator');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const postContainer = document.getElementById('postContainer');
const postTitle = document.getElementById('postTitle');
const authorName = document.getElementById('authorName');
const postDate = document.getElementById('postDate');
const viewCount = document.getElementById('viewCount');
const postContent = document.getElementById('postContent');
const postActions = document.getElementById('postActions');
const commentsSection = document.getElementById('commentsSection');

// 댓글 관련 DOM 요소
const commentCount = document.getElementById('commentCount');
const commentFormContainer = document.getElementById('commentFormContainer');
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const commentLength = document.getElementById('commentLength');
const loginPrompt = document.getElementById('loginPrompt');
const commentsList = document.getElementById('commentsList');
const emptyComments = document.getElementById('emptyComments');

// ==================== 게시글 로드 ====================
async function loadPost(newCommentId = null) {
    showLoading(true);
    hideError();
    hidePost();

    try {
        // URL에서 게시글 ID 가져오기
        const params = getQueryParams();
        postId = params.id;

        if (!postId) {
            showError('게시글 ID가 없습니다.');
            return;
        }

        // 백엔드 API 호출
        const response = await getPostById(postId);

        if (!response.success) {
            showError(response.error || '게시글을 불러올 수 없습니다.');
            return;
        }

        currentPost = response.data;

        renderPost(currentPost, newCommentId);
        showPost();
    } catch (error) {
        console.error('게시글을 불러오는 중 오류가 발생했습니다:', error);
        showError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// ==================== 게시글 렌더링 ====================
function renderPost(post, newCommentId = null) {
    postTitle.textContent = post.title;
    authorName.textContent = post.author.nickname;
    postDate.textContent = formatDate(post.createdAt);

    // 조회수 표시
    if (viewCount && post.viewCount !== undefined) {
        viewCount.textContent = formatNumber(post.viewCount);
        viewCount.closest('.post-stat')?.style.removeProperty('display');
    } else if (viewCount) {
        viewCount.closest('.post-stat')?.style.setProperty('display', 'none');
    }

    // 내용을 텍스트로 표시 (보안을 위해 innerHTML 대신 textContent 사용)
    // 단, 줄바꿈은 <br>로 변환
    postContent.innerHTML = escapeHtml(post.content).replace(/\n/g, '<br>');

    // 로그인한 사용자가 작성자인 경우 수정/삭제 버튼 표시
    const currentUser = authState.getState();
    if (currentUser.isLoggedIn && currentUser.user?.userId === post.author.userId) {
        postActions.style.display = 'flex';
    } else {
        postActions.style.display = 'none';
    }

    // 댓글 섹션 표시
    commentsSection.style.display = 'block';

    // 댓글 렌더링 (새 댓글 ID 전달)
    renderComments(post.comments || [], newCommentId);

    // 댓글 작성 폼 표시/숨김 (위에서 선언한 currentUser 재사용)
    if (currentUser.isLoggedIn) {
        commentFormContainer.style.display = 'block';
        loginPrompt.style.display = 'none';
    } else {
        commentFormContainer.style.display = 'none';
        loginPrompt.style.display = 'block';
    }
}

// ==================== UI 상태 관리 ====================
function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.style.display = 'flex';
}

function hideError() {
    errorState.style.display = 'none';
}

function showPost() {
    postContainer.style.display = 'block';
}

function hidePost() {
    postContainer.style.display = 'none';
}

// ==================== 유틸리티 함수 ====================
function formatDate(date) {
    return new Date(date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * 숫자 포맷팅 (1000 -> 1k)
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

/**
 * HTML 특수문자 이스케이프
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 게시글 수정 처리
 */
function handleEditPost() {
    if (!currentPost) return;
    navigateTo(`/pages/post-form.html?id=${currentPost.id}`);
}

/**
 * 게시글 삭제 처리
 */
async function handleDeletePost() {
    if (!currentPost) return;

    const confirmed = await modal.confirm({
        title: '게시글 삭제',
        message: '정말로 이 게시글을 삭제하시겠습니까?',
        variant: 'danger',
        confirmText: '삭제',
        cancelText: '취소',
    });

    if (!confirmed) return;

    try {
        const response = await deletePost(currentPost.id);

        if (response.success) {
            toast.success('게시글이 삭제되었습니다.');
            navigateTo(ROUTES.HOME);
        } else {
            const errorMessage = getContextualErrorMessage(response, '게시글 삭제');
            toast.error(errorMessage);
        }
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        toast.error('게시글 삭제 중 네트워크 오류가 발생했습니다.');
    }
}

// ==================== 댓글 관련 함수 ====================
/**
 * 단일 댓글 DOM 생성
 * @param {Object} comment - 댓글 데이터
 * @param {boolean} isNewComment - 새 댓글 여부 (애니메이션용)
 * @returns {string} 댓글 HTML
 */
function createCommentElement(comment, isNewComment = false) {
    const currentUser = authState.getState();
    const isAuthor = currentUser.isLoggedIn && currentUser.user?.userId === comment.author.userId;

    /* eslint-disable indent */
    return `
        <div class="comment-item ${isNewComment ? 'new-comment' : ''}" data-comment-id="${comment.id}">
            <div class="comment-header">
                <span class="comment-author">${escapeHtml(comment.author.nickname)}</span>
                <span class="comment-date">${formatDate(comment.createdAt)}</span>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
            ${
                isAuthor
                    ? `
                <div class="comment-actions">
                    <button type="button" class="btn-text comment-edit-btn" data-comment-id="${comment.id}">수정</button>
                    <button type="button" class="btn-text comment-delete-btn" data-comment-id="${comment.id}">삭제</button>
                </div>
            `
                    : ''
            }
        </div>
    `;
    /* eslint-enable indent */
}

/**
 * 댓글 목록 렌더링
 * @param {Array} comments - 댓글 목록
 * @param {number|null} newCommentId - 새로 작성된 댓글 ID (애니메이션 적용용)
 */
function renderComments(comments, newCommentId = null) {
    commentCount.textContent = comments.length;

    if (comments.length === 0) {
        commentsList.innerHTML = '';
        emptyComments.style.display = 'block';
        return;
    }

    emptyComments.style.display = 'none';

    // 최신순 정렬 (createdAt 기준 내림차순)
    const sortedComments = [...comments].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const commentsHtml = sortedComments
        .map((comment) => {
            const isNewComment = newCommentId && comment.id === newCommentId;
            return createCommentElement(comment, isNewComment);
        })
        .join('');

    commentsList.innerHTML = commentsHtml;

    // 댓글 수정/삭제 버튼 이벤트 리스너 추가
    attachCommentActionListeners();
}

/**
 * 댓글 작성 처리
 */
async function handleCommentSubmit(e) {
    e.preventDefault();

    const content = commentInput.value.trim();
    const validation = validateCommentContent(content);

    if (!validation.isValid) {
        showInputError(commentInput, validation.message);
        commentInput.focus();
        return;
    }

    // 검증 통과 시 에러 제거
    hideInputError(commentInput);

    try {
        const response = await createComment(postId, content);

        if (response.success) {
            toast.success('댓글이 작성되었습니다.');
            commentInput.value = '';
            updateCommentLength();

            // 새 댓글 데이터 추출
            const newComment = response.data;

            if (newComment) {
                // 빈 댓글 상태 숨기기
                emptyComments.style.display = 'none';

                // 새 댓글 DOM 생성 (애니메이션 적용)
                const commentHtml = createCommentElement(newComment, true);

                // 맨 위에 새 댓글 추가
                commentsList.insertAdjacentHTML('afterbegin', commentHtml);

                // 댓글 카운트 업데이트
                const currentCount = parseInt(commentCount.textContent, 10);
                commentCount.textContent = currentCount + 1;

                // 이벤트 리스너 재등록 (새로 추가된 버튼에 대해)
                attachCommentActionListeners();
            }
        } else {
            const errorMessage = getContextualErrorMessage(response, '댓글 작성');
            toast.error(errorMessage);
        }
    } catch (error) {
        console.error('댓글 작성 실패:', error);
        toast.error('댓글 작성 중 네트워크 오류가 발생했습니다.');
    }
}

/**
 * 댓글 글자 수 업데이트
 */
function updateCommentLength() {
    const length = commentInput?.value.length || 0;
    if (commentLength) {
        commentLength.textContent = `${length}/500`;
    }
}

/**
 * 댓글 수정 처리 (인라인 편집)
 */
function handleCommentEdit(commentId) {
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentItem) return;

    const contentElement = commentItem.querySelector('.comment-content');
    const currentContent = contentElement.textContent;

    // 인라인 편집 모드 진입
    enterEditMode(commentItem, currentContent, commentId);
}

/**
 * 인라인 편집 모드 진입
 */
function enterEditMode(commentItem, currentContent, commentId) {
    // 이미 편집 중이면 무시
    if (commentItem.classList.contains('editing')) return;

    // 편집 모드 클래스 추가
    commentItem.classList.add('editing');

    // 편집 폼 HTML 생성
    const editFormHTML = `
        <div class="comment-edit-form">
            <textarea
                class="comment-edit-textarea"
                maxlength="500"
                placeholder="댓글을 입력하세요"
            >${currentContent}</textarea>
            <div class="comment-edit-error"></div>
            <div class="comment-edit-footer">
                <span class="comment-edit-counter"><span class="current">${currentContent.length}</span>/500</span>
                <div class="comment-edit-actions">
                    <button type="button" class="btn btn-secondary btn-sm comment-cancel-btn">취소</button>
                    <button type="button" class="btn btn-primary btn-sm comment-save-btn">저장</button>
                </div>
            </div>
        </div>
    `;

    // 댓글 내용 요소 다음에 편집 폼 삽입
    const contentElement = commentItem.querySelector('.comment-content');
    contentElement.insertAdjacentHTML('afterend', editFormHTML);

    // 편집 폼 요소들 가져오기
    const textarea = commentItem.querySelector('.comment-edit-textarea');
    const saveBtn = commentItem.querySelector('.comment-save-btn');
    const cancelBtn = commentItem.querySelector('.comment-cancel-btn');

    // textarea에 포커스 및 커서를 끝으로 이동
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    // 실시간 검증 및 글자수 카운터
    textarea.addEventListener('input', () => {
        validateCommentEdit(commentItem);
    });

    // 저장 버튼 이벤트
    saveBtn.addEventListener('click', () => {
        saveCommentEdit(commentId, commentItem);
    });

    // 취소 버튼 이벤트
    cancelBtn.addEventListener('click', () => {
        cancelCommentEdit(commentItem);
    });

    // ESC 키로 취소
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            cancelCommentEdit(commentItem);
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 초기 검증
    validateCommentEdit(commentItem);
}

/**
 * 댓글 편집 검증
 */
function validateCommentEdit(commentItem) {
    const textarea = commentItem.querySelector('.comment-edit-textarea');
    const errorElement = commentItem.querySelector('.comment-edit-error');
    const saveBtn = commentItem.querySelector('.comment-save-btn');
    const counter = commentItem.querySelector('.comment-edit-counter');
    const currentSpan = counter.querySelector('.current');

    const value = textarea.value.trim();
    const length = value.length;

    // 글자수 업데이트
    currentSpan.textContent = length;

    // 글자수 카운터 색상 변경
    counter.classList.remove('warning', 'error');
    if (length > 500) {
        counter.classList.add('error');
    } else if (length > 400) {
        counter.classList.add('warning');
    }

    // 검증
    const validation = validateCommentContent(value);

    if (!validation.isValid) {
        // 에러 상태
        textarea.classList.add('error');
        errorElement.textContent = validation.message;
        saveBtn.disabled = true;
    } else {
        // 정상 상태
        textarea.classList.remove('error');
        errorElement.textContent = '';
        saveBtn.disabled = false;
    }
}

/**
 * 댓글 저장
 */
async function saveCommentEdit(commentId, commentItem) {
    const textarea = commentItem.querySelector('.comment-edit-textarea');
    const value = textarea.value.trim();

    // 최종 검증
    const validation = validateCommentContent(value);
    if (!validation.isValid) {
        return;
    }

    try {
        const response = await updateComment(commentId, value);

        if (response.success) {
            toast.success('댓글이 수정되었습니다.');

            // 댓글 내용 부분만 업데이트
            const contentElement = commentItem.querySelector('.comment-content');
            if (contentElement) {
                contentElement.textContent = value;
            }

            // 편집 모드 종료
            cancelCommentEdit(commentItem);
        } else {
            const errorMessage = getContextualErrorMessage(response, '댓글 수정');
            toast.error(errorMessage);
        }
    } catch (error) {
        console.error('댓글 수정 실패:', error);
        toast.error('댓글 수정 중 네트워크 오류가 발생했습니다.');
    }
}

/**
 * 댓글 편집 취소
 */
function cancelCommentEdit(commentItem) {
    // 편집 모드 클래스 제거
    commentItem.classList.remove('editing');

    // 편집 폼 제거
    const editForm = commentItem.querySelector('.comment-edit-form');
    if (editForm) {
        editForm.remove();
    }
}

/**
 * 댓글 삭제 처리
 */
async function handleCommentDelete(commentId) {
    const confirmed = await modal.confirm({
        title: '댓글 삭제',
        message: '정말로 이 댓글을 삭제하시겠습니까?',
        variant: 'danger',
        confirmText: '삭제',
        cancelText: '취소',
    });

    if (!confirmed) return;

    try {
        const response = await deleteComment(commentId);

        if (response.success) {
            toast.success('댓글이 삭제되었습니다.');

            // 삭제할 댓글 DOM 찾기
            const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);

            if (commentItem) {
                // fadeOut 애니메이션 추가
                commentItem.classList.add('deleting');

                // 애니메이션 완료 후 DOM에서 제거
                setTimeout(() => {
                    commentItem.remove();

                    // 댓글 카운트 업데이트
                    const currentCount = parseInt(commentCount.textContent, 10);
                    commentCount.textContent = currentCount - 1;

                    // 댓글이 0개가 되면 빈 상태 표시
                    if (currentCount - 1 === 0) {
                        emptyComments.style.display = 'block';
                    }
                }, 300); // fadeOut 애니메이션 시간과 일치
            }
        } else {
            const errorMessage = getContextualErrorMessage(response, '댓글 삭제');
            toast.error(errorMessage);
        }
    } catch (error) {
        console.error('댓글 삭제 실패:', error);
        toast.error('댓글 삭제 중 네트워크 오류가 발생했습니다.');
    }
}

/**
 * 댓글 액션 버튼 이벤트 리스너 추가
 */
function attachCommentActionListeners() {
    // 수정 버튼
    document.querySelectorAll('.comment-edit-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const commentId = e.target.dataset.commentId;
            handleCommentEdit(commentId);
        });
    });

    // 삭제 버튼
    document.querySelectorAll('.comment-delete-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const commentId = e.target.dataset.commentId;
            handleCommentDelete(commentId);
        });
    });
}

// ==================== 초기화 ====================
function init() {
    loadPost();
    attachEventListeners();
}

// ==================== 이벤트 리스너 ====================
function attachEventListeners() {
    // 홈으로 돌아가기 버튼
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            navigateTo(ROUTES.HOME);
        });
    }

    // 목록으로 버튼
    const backToListBtn = document.getElementById('backToListBtn');
    if (backToListBtn) {
        backToListBtn.addEventListener('click', () => {
            navigateTo(ROUTES.HOME);
        });
    }

    // 로그인하기 버튼
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', () => {
            navigateTo(ROUTES.LOGIN);
        });
    }

    // 수정 버튼
    const editPostBtn = document.getElementById('editPostBtn');
    if (editPostBtn) {
        editPostBtn.addEventListener('click', handleEditPost);
    }

    // 삭제 버튼
    const deletePostBtn = document.getElementById('deletePostBtn');
    if (deletePostBtn) {
        deletePostBtn.addEventListener('click', handleDeletePost);
    }

    // 댓글 작성 폼 제출
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }

    // 댓글 입력 시 글자 수 카운트
    if (commentInput) {
        commentInput.addEventListener('input', updateCommentLength);
    }
}

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
