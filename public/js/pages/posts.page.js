/**
 * 게시글 목록 페이지
 * 무한 스크롤링을 지원하는 게시글 목록
 */

import { navigateWithParams } from '../utils/router.js';
import { ROUTES } from '../utils/router.js';
import { fetchPosts, transformPostsResponse } from '../services/posts.service.js';

// ==================== 상태 관리 ====================
let currentCursor = null; // 커서 기반 페이지네이션: { id, createdAt } 또는 null
let isLoading = false;
let hasMore = true;
const POSTS_PER_PAGE = 10;

// DOM 요소
const postsList = document.getElementById('postsList');
const scrollSentinel = document.getElementById('scrollSentinel');
const loadingIndicator = document.getElementById('loadingIndicator');
const endMessage = document.getElementById('endMessage');
const emptyState = document.getElementById('emptyState');

// ==================== 유틸리티 함수 ====================

// 날짜를 상대적 시간으로 변환
function getRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return '방금 전';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}시간 전`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}

// 숫자를 포맷팅 (1000 -> 1k)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// ==================== 게시글 카드 생성 ====================
function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.dataset.postId = post.id;

    const imageHTML = post.image
        ? `<img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy" />`
        : '';

    card.innerHTML = `
        <div class="post-card-header">
            <img 
                src="${post.authorAvatar}" 
                alt="${post.author}" 
                class="post-author-avatar"
                loading="lazy"
            />
            <div class="post-author-info">
                <div class="post-author-name">${post.author}</div>
                <div class="post-meta">
                    <span class="post-date">${getRelativeTime(post.date)}</span>
                    <span class="post-views">조회 ${formatNumber(post.views)}</span>
                </div>
            </div>
        </div>

        ${imageHTML}

        <div class="post-card-content">
            <h2 class="post-title">${post.title}</h2>
            <p class="post-excerpt">${post.excerpt}</p>
        </div>

        <div class="post-card-footer">
            <div class="post-stat">
                <span class="post-stat-icon">
                    <svg class="icon icon-sm" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </span>
                <span class="post-stat-count">${formatNumber(post.likes)}</span>
            </div>
            <div class="post-stat">
                <span class="post-stat-icon">
                    <svg class="icon icon-sm" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </span>
                <span class="post-stat-count">${formatNumber(post.comments)}</span>
            </div>
        </div>
    `;

    // 카드 클릭 이벤트
    card.addEventListener('click', () => {
        handlePostClick(post.id);
    });

    return card;
}

// ==================== 게시글 로드 ====================
async function loadPosts() {
    if (isLoading || !hasMore) {
        return;
    }

    isLoading = true;
    showLoading(true);

    try {
        // 백엔드 API 호출 (커서 기반 페이지네이션)
        const response = await fetchPosts(currentCursor, POSTS_PER_PAGE);

        if (!response.success) {
            throw new Error(response.error || '게시글을 불러오는 데 실패했습니다.');
        }

        // 응답 데이터 변환
        const { posts, cursor } = transformPostsResponse(response);

        // 게시글이 없는 경우
        if (posts.length === 0) {
            if (currentCursor === null) {
                // 첫 페이지에 게시글이 없으면 빈 상태 표시
                showEmptyState();
            } else {
                // 더 이상 게시글이 없으면 끝 메시지 표시
                hasMore = false;
                showEndMessage();
            }
            showLoading(false);
            return;
        }

        // 게시글 카드 추가
        posts.forEach((post) => {
            const card = createPostCard(post);
            postsList.appendChild(card);
        });

        // 커서 업데이트 및 hasMore 상태 갱신
        if (cursor && cursor.hasNext) {
            currentCursor = {
                id: cursor.id,
                createdAt: cursor.createdAt,
            };
            hasMore = true;
        } else {
            hasMore = false;
            showEndMessage();
        }

        showLoading(false);
    } catch (error) {
        console.error('게시글을 불러오는 중 오류가 발생했습니다:', error);
        showLoading(false);
        // TODO: 에러 처리 UI 개선 (재시도 버튼 등)
    } finally {
        isLoading = false;
    }
}

// ==================== UI 상태 관리 ====================
function showLoading(show) {
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

function showEndMessage() {
    endMessage.style.display = 'block';
}

function showEmptyState() {
    emptyState.style.display = 'flex';
    postsList.style.display = 'none';
}

// ==================== 이벤트 핸들러 ====================
function handlePostClick(postId) {
    // 게시글 상세 페이지로 이동
    navigateWithParams(ROUTES.POST_DETAIL, { id: postId });
}

// ==================== 무한 스크롤 구현 (Intersection Observer) ====================
function setupIntersectionObserver() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && hasMore && !isLoading) {
                    loadPosts();
                }
            });
        },
        {
            rootMargin: '200px', // 하단 200px 전에 트리거
            threshold: 0,
        }
    );

    observer.observe(scrollSentinel);

    return observer;
}

// ==================== 초기화 ====================
function init() {
    // 첫 페이지 로드
    loadPosts();

    // 무한 스크롤 설정
    setupIntersectionObserver();
}

// 페이지 로드 시 초기화
init();
