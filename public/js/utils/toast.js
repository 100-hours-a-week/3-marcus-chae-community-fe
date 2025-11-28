/**
 * 토스트 알림 유틸리티
 * alert 대신 사용하는 사용자 친화적인 알림 시스템
 * 스타일: /css/components/toast.css
 */

class Toast {
    constructor() {
        this.container = null;
        this.init();
    }

    /**
     * CSS 변수에서 duration 값 가져오기
     * @param {string} variableName - CSS 변수 이름
     * @returns {number} duration (밀리초)
     */
    getCssDuration(variableName) {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(variableName)
            .trim();
        // "300ms" 같은 문자열에서 숫자만 추출
        return parseFloat(value);
    }

    /**
     * 토스트 컨테이너 초기화
     */
    init() {
        // 토스트 컨테이너가 이미 있는지 확인
        this.container = document.getElementById('toast-container');

        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * 토스트 메시지 표시
     * @param {string} message - 표시할 메시지
     * @param {string} type - 토스트 타입 (success, error, info, warning)
     * @param {number} duration - 표시 시간 (밀리초, 0이면 자동으로 사라지지 않음)
     */
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // 아이콘 선택
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warning: '⚠',
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" aria-label="닫기">×</button>
        `;

        // 닫기 버튼 이벤트
        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => {
            this.hide(toast);
        });

        // 컨테이너에 추가
        this.container.appendChild(toast);

        // 자동으로 사라지기
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * 토스트 숨기기
     * @param {HTMLElement} toast - 숨길 토스트 요소
     */
    hide(toast) {
        toast.classList.add('hiding');
        // CSS 변수에서 duration 가져오기 (단위 없는 숫자)
        const duration = this.getCssDuration('--duration-slower-ms') || 600;
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);
    }

    /**
     * 성공 메시지 표시
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 표시 시간
     */
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    /**
     * 에러 메시지 표시
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 표시 시간
     */
    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    /**
     * 정보 메시지 표시
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 표시 시간
     */
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    /**
     * 경고 메시지 표시
     * @param {string} message - 표시할 메시지
     * @param {number} duration - 표시 시간
     */
    warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }
}

// 싱글톤 인스턴스 생성 및 내보내기 (named export)
const toast = new Toast();
export { toast, Toast };
