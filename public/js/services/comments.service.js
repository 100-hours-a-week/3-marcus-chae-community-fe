/**
 * 댓글 관련 API 서비스
 * 댓글 작성, 수정, 삭제 등을 담당합니다.
 */

import { post, patch, del } from './api.service.js';

/**
 * 댓글 작성
 * @param {number} postId - 게시글 ID
 * @param {string} content - 댓글 내용 (최대 500자)
 * @returns {Promise<ApiResponse>}
 */
export async function createComment(postId, content) {
    const response = await post(`/posts/${postId}/comments`, {
        content: content,
    });

    if (!response.success) {
        console.error('댓글 작성 실패:', response.error);
    }

    return response;
}

/**
 * 댓글 수정
 * @param {number} commentId - 댓글 ID
 * @param {string} content - 수정할 댓글 내용 (최대 500자)
 * @returns {Promise<ApiResponse>}
 */
export async function updateComment(commentId, content) {
    const response = await patch(`/comments/${commentId}`, {
        content: content,
    });

    if (!response.success) {
        console.error('댓글 수정 실패:', response.error);
    }

    return response;
}

/**
 * 댓글 삭제
 * @param {number} commentId - 댓글 ID
 * @returns {Promise<ApiResponse>}
 */
export async function deleteComment(commentId) {
    const response = await del(`/comments/${commentId}`);

    if (!response.success) {
        console.error('댓글 삭제 실패:', response.error);
    }

    return response;
}

export default {
    createComment,
    updateComment,
    deleteComment,
};
