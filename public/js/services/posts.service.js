/**
 * 게시글 관련 API 서비스
 * 게시글 목록 조회, 상세 조회 등을 담당합니다.
 */

import { get, post, patch, del } from './api.service.js';

/**
 * 게시글 목록 조회 (커서 기반 페이지네이션)
 * @param {Object|null} cursor - 이전 페이지의 커서 정보 { id, createdAt }
 * @param {number} size - 한 페이지당 게시글 수
 * @returns {Promise<ApiResponse>}
 */
export async function fetchPosts(cursor = null, size = 10) {
    const params = { size };

    // 커서가 있으면 쿼리 파라미터에 추가 (다음 페이지 요청)
    if (cursor && cursor.id && cursor.createdAt) {
        params.cursorId = cursor.id;
        params.cursorCreatedAt = cursor.createdAt;
    }

    return await get('/posts', params);
}

/**
 * 게시글 작성
 * @param {string} title - 게시글 제목 (최대 26자)
 * @param {string} content - 게시글 내용 (최대 15000자)
 * @returns {Promise<ApiResponse>}
 */
export async function createPost(title, content) {
    const response = await post('/posts', {
        title: title,
        content: content,
    });

    if (!response.success) {
        console.error('게시글 작성 실패:', response.error);
    }

    return response;
}

/**
 * 게시글 상세 조회
 * @param {number} id - 게시글 ID
 * @returns {Promise<ApiResponse>}
 */
export async function getPostById(id) {
    const response = await get(`/posts/${id}`);

    if (!response.success) {
        console.error('게시글 조회 실패:', response.error);
    }

    return response;
}

/**
 * 게시글 수정
 * @param {number} id - 게시글 ID
 * @param {string} title - 수정할 제목 (최대 26자)
 * @param {string} content - 수정할 내용 (최대 15000자)
 * @returns {Promise<ApiResponse>}
 */
export async function updatePost(id, title, content) {
    const response = await patch(`/posts/${id}`, {
        title: title,
        content: content,
    });

    if (!response.success) {
        console.error('게시글 수정 실패:', response.error);
    }

    return response;
}

/**
 * 게시글 삭제
 * @param {number} id - 게시글 ID
 * @returns {Promise<ApiResponse>}
 */
export async function deletePost(id) {
    const response = await del(`/posts/${id}`);

    if (!response.success) {
        console.error('게시글 삭제 실패:', response.error);
    }

    return response;
}

/**
 * 백엔드 게시글 객체를 프론트엔드 형식으로 변환
 * @param {Object} backendPost - 백엔드 게시글 객체
 * @returns {Object} 프론트엔드 게시글 객체
 */
export function transformPost(backendPost) {
    return {
        id: backendPost.id,
        title: backendPost.title,
        excerpt: backendPost.content || backendPost.excerpt || '내용을 확인하려면 클릭하세요.',
        author: backendPost.authorNickname,
        authorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(backendPost.authorNickname)}&background=random`,
        date: new Date(backendPost.createdAt),
        views: 0, // 임시 기본값
        likes: 0, // 임시 기본값
        comments: 0, // 임시 기본값
        image: null, // 썸네일 없음
    };
}

/**
 * 게시글 목록 응답을 변환
 * @param {Object} response - 백엔드 API 응답
 * @returns {Object} { posts: [], cursor: { id, createdAt, hasNext } }
 */
export function transformPostsResponse(response) {
    if (!response.success || !response.data) {
        return { posts: [], cursor: null };
    }

    const { posts, cursor } = response.data;

    return {
        posts: posts.map(transformPost),
        cursor: cursor || null,
    };
}

export default {
    fetchPosts,
    createPost,
    getPostById,
    updatePost,
    deletePost,
    transformPost,
    transformPostsResponse,
};