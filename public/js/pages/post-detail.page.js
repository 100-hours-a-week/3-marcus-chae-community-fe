/**
 * 게시글 상세보기 페이지
 */

import { getQueryParams, navigateTo, ROUTES } from '../utils/router.js';
import { getPostById, deletePost } from '../services/posts.service.js';
import { createComment, updateComment, deleteComment } from '../services/comments.service.js';
import { authState } from '../state/auth.state.js';
import toast from '../utils/toast.js';
import { validateCommentContent } from '../utils/validators.js';

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
async function loadPost() {
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

        renderPost(currentPost);
        showPost();
    } catch (error) {
        console.error('게시글을 불러오는 중 오류가 발생했습니다:', error);
        showError('게시글을 불러오는 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// ==================== 게시글 렌더링 ====================
function renderPost(post) {
    postTitle.textContent = post.title;
    authorName.textContent = post.author.nickname;
    postDate.textContent = formatDate(post.createdAt);

    // 조회수는 OpenAPI 응답에 없으므로 임시로 숨김
    if (viewCount) {
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

    // 댓글 렌더링
    renderComments(post.comments || []);

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

    const confirmed = confirm('정말로 이 게시글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
        const response = await deletePost(currentPost.id);

        if (response.success) {
            toast.success('게시글이 삭제되었습니다.');
            navigateTo(ROUTES.HOME);
        } else {
            toast.error(response.error || '게시글 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        toast.error('게시글 삭제에 실패했습니다.');
    }
}

// ==================== 댓글 관련 함수 ====================
/**
 * 댓글 목록 렌더링
 */
function renderComments(comments) {
    commentCount.textContent = comments.length;

    if (comments.length === 0) {
        commentsList.innerHTML = '';
        emptyComments.style.display = 'block';
        return;
    }

    emptyComments.style.display = 'none';

    const currentUser = authState.getState();
    const commentsHtml = comments
        .map((comment) => {
            const isAuthor = currentUser.isLoggedIn && currentUser.user?.userId === comment.author.userId;

            return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.author.nickname)}</span>
                    <span class="comment-date">${formatDate(comment.createdAt)}</span>
                </div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
                ${
    isAuthor
        ? `
                    <div class="comment-actions">
                        <button class="btn-text comment-edit-btn" data-comment-id="${comment.id}">수정</button>
                        <button class="btn-text comment-delete-btn" data-comment-id="${comment.id}">삭제</button>
                    </div>
                `
        : ''
}
            </div>
        `;
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
        toast.error(validation.message);
        return;
    }

    try {
        const response = await createComment(postId, content);

        if (response.success) {
            toast.success('댓글이 작성되었습니다.');
            commentInput.value = '';
            updateCommentLength();

            // 게시글 다시 로드하여 댓글 목록 갱신
            await loadPost();
        } else {
            toast.error(response.error || '댓글 작성에 실패했습니다.');
        }
    } catch (error) {
        console.error('댓글 작성 실패:', error);
        toast.error('댓글 작성에 실패했습니다.');
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
 * 댓글 수정 처리
 */
async function handleCommentEdit(commentId) {
    const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (!commentItem) return;

    const contentElement = commentItem.querySelector('.comment-content');
    const currentContent = contentElement.textContent;

    const newContent = prompt('댓글을 수정하세요:', currentContent);
    if (newContent === null || newContent.trim() === '') return;

    const validation = validateCommentContent(newContent.trim());
    if (!validation.isValid) {
        toast.error(validation.message);
        return;
    }

    try {
        const response = await updateComment(commentId, newContent.trim());

        if (response.success) {
            toast.success('댓글이 수정되었습니다.');
            await loadPost();
        } else {
            toast.error(response.error || '댓글 수정에 실패했습니다.');
        }
    } catch (error) {
        console.error('댓글 수정 실패:', error);
        toast.error('댓글 수정에 실패했습니다.');
    }
}

/**
 * 댓글 삭제 처리
 */
async function handleCommentDelete(commentId) {
    const confirmed = confirm('정말로 이 댓글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
        const response = await deleteComment(commentId);

        if (response.success) {
            toast.success('댓글이 삭제되었습니다.');
            await loadPost();
        } else {
            toast.error(response.error || '댓글 삭제에 실패했습니다.');
        }
    } catch (error) {
        console.error('댓글 삭제 실패:', error);
        toast.error('댓글 삭제에 실패했습니다.');
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
