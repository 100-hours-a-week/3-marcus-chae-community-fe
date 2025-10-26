/**
 * 게시글 상세보기 페이지
 */

import { getQueryParams } from '../utils/router.js';

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

// ==================== Mock Data ====================
// TODO: 백엔드 API 연결 시 제거
function generateMockPost(id) {
    const mockAuthors = ['김철수', '이영희', '박민수', '정수진', '최동욱'];
    const mockTitles = [
        '프론트엔드 개발자의 하루',
        'React vs Vue - 어떤 것을 선택해야 할까?',
        'TypeScript로 더 안전한 코드 작성하기',
        'CSS Grid와 Flexbox 완벽 가이드',
        '웹 접근성이 중요한 이유',
    ];

    const mockContents = [
        `
            <p>오늘은 프로젝트에서 새로운 기능을 구현했습니다. 사용자 경험을 개선하기 위해 여러 가지 시도를 해보았습니다.</p>
            <h2>구현한 기능</h2>
            <ul>
                <li>무한 스크롤링 기능 추가</li>
                <li>이미지 lazy loading 적용</li>
                <li>스켈레톤 UI 구현</li>
            </ul>
            <h2>느낀 점</h2>
            <p>사용자 경험을 개선하는 것은 단순히 기능을 추가하는 것이 아니라, 사용자의 니즈를 정확히 파악하고 그에 맞는 솔루션을 제공하는 것이라는 것을 다시 한번 깨달았습니다.</p>
            <p>앞으로도 계속해서 사용자 중심의 개발을 해나가겠습니다.</p>
        `,
        `
            <p>최근 프로젝트를 진행하면서 프레임워크 선택에 대해 고민이 많았습니다.</p>
            <h2>React의 장점</h2>
            <p>React는 강력한 생태계와 커뮤니티를 가지고 있습니다. 다양한 라이브러리와 도구들이 존재하며, 문제 해결을 위한 자료도 풍부합니다.</p>
            <h2>Vue의 장점</h2>
            <p>Vue는 학습 곡선이 완만하고, 문서화가 잘 되어 있습니다. 또한 점진적으로 도입할 수 있어 기존 프로젝트에 적용하기 좋습니다.</p>
        `,
    ];

    const index = (id - 1) % mockAuthors.length;
    const contentIndex = (id - 1) % mockContents.length;

    return {
        id: id,
        title: `${mockTitles[index]} #${id}`,
        content: mockContents[contentIndex],
        author: mockAuthors[index],
        authorId: index + 1,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        views: Math.floor(Math.random() * 1000) + 50,
        likes: Math.floor(Math.random() * 100) + 5,
        comments: [],
    };
}

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

        // TODO: 백엔드 API 호출로 변경
        // const response = await fetch(`/api/v1/posts/${postId}`);
        // const data = await response.json();
        // currentPost = data;

        // Mock API 호출 시뮬레이션
        await new Promise((resolve) => setTimeout(resolve, 1000));
        currentPost = generateMockPost(parseInt(postId));

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
    authorName.textContent = post.author;
    postDate.textContent = formatDate(post.date);
    viewCount.textContent = formatNumber(post.views);
    postContent.innerHTML = post.content;

    // TODO: 로그인한 사용자가 작성자인 경우 수정/삭제 버튼 표시
    // if (authState.user?.id === post.authorId) {
    //     postActions.style.display = 'flex';
    // }

    // 댓글 섹션 표시
    commentsSection.style.display = 'block';
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

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
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
            location.href = '/';
        });
    }

    // 목록으로 버튼
    const backToListBtn = document.getElementById('backToListBtn');
    if (backToListBtn) {
        backToListBtn.addEventListener('click', () => {
            location.href = '/';
        });
    }

    // 로그인하기 버튼
    const goToLoginBtn = document.getElementById('goToLoginBtn');
    if (goToLoginBtn) {
        goToLoginBtn.addEventListener('click', () => {
            location.href = '/login';
        });
    }
}

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
