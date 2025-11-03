/**
 * 모달 유틸리티
 * confirm, prompt를 대체하는 사용자 친화적인 모달 시스템
 * Web Components 기반으로 구현
 */

class Modal {
    /**
     * 확인 모달 표시
     * @param {Object} options - 모달 옵션
     * @param {string} options.title - 모달 제목
     * @param {string} options.message - 확인 메시지
     * @param {string} [options.variant='info'] - 모달 타입 (danger, warning, info)
     * @param {string} [options.confirmText='확인'] - 확인 버튼 텍스트
     * @param {string} [options.cancelText='취소'] - 취소 버튼 텍스트
     * @returns {Promise<boolean>} 확인: true, 취소: false
     */
    async confirm({
        title = '확인',
        message = '계속하시겠습니까?',
        variant = 'info',
        confirmText = '확인',
        cancelText = '취소',
    } = {}) {
        // modal-confirm 컴포넌트 동적 import
        await import('../components/modal-confirm.component.js');

        // CSS 로드
        this.loadStyles([
            '/css/components/modal.css',
            '/css/components/modal-confirm.css',
        ]);

        // 컴포넌트 생성
        const modalElement = document.createElement('modal-confirm');
        modalElement.setAttribute('title', title);
        modalElement.setAttribute('message', message);
        modalElement.setAttribute('variant', variant);
        modalElement.setAttribute('confirm-text', confirmText);
        modalElement.setAttribute('cancel-text', cancelText);

        // DOM에 추가
        document.body.appendChild(modalElement);

        // 사용자 응답 대기
        const result = await modalElement.waitForResponse();

        return result;
    }

    /**
     * 입력 모달 표시
     * @param {Object} options - 모달 옵션
     * @param {string} options.title - 모달 제목
     * @param {string} [options.initialValue=''] - 초기 입력값
     * @param {number} [options.maxLength=500] - 최대 글자수
     * @param {string} [options.placeholder='내용을 입력하세요'] - placeholder
     * @returns {Promise<string|null>} 입력값 또는 null (취소 시)
     */
    async input({
        title = '입력',
        initialValue = '',
        maxLength = 500,
        placeholder = '내용을 입력하세요',
    } = {}) {
        // modal-input 컴포넌트 동적 import
        await import('../components/modal-input.component.js');

        // CSS 로드
        this.loadStyles([
            '/css/components/modal.css',
            '/css/components/modal-input.css',
        ]);

        // 컴포넌트 생성
        const modalElement = document.createElement('modal-input');
        modalElement.setAttribute('title', title);
        modalElement.setAttribute('initial-value', initialValue);
        modalElement.setAttribute('max-length', maxLength.toString());
        modalElement.setAttribute('placeholder', placeholder);

        // DOM에 추가
        document.body.appendChild(modalElement);

        // 사용자 응답 대기
        const result = await modalElement.waitForResponse();

        return result;
    }

    /**
     * CSS 파일 동적 로드 (중복 방지)
     * @param {string[]} stylePaths - CSS 파일 경로 배열
     */
    loadStyles(stylePaths) {
        stylePaths.forEach((path) => {
            // 이미 로드된 스타일인지 확인
            const existingLink = document.querySelector(
                `link[href="${path}"]`
            );
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = path;
                document.head.appendChild(link);
            }
        });
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
const modal = new Modal();
export default modal;
