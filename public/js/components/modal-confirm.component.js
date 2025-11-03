/**
 * Modal Confirm Web Component
 * 확인/취소 대화상자 컴포넌트
 * 스타일: /css/components/modal.css, /css/components/modal-confirm.css
 */

class ModalConfirmComponent extends HTMLElement {
    constructor() {
        super();
        this.resolvePromise = null;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        // 포커스를 모달로 이동 (접근성)
        setTimeout(() => {
            const cancelButton = this.querySelector('.btn-cancel');
            if (cancelButton) {
                cancelButton.focus();
            }
        }, 100);
    }

    render() {
        const title = this.getAttribute('title') || '확인';
        const message = this.getAttribute('message') || '계속하시겠습니까?';
        const variant = this.getAttribute('variant') || 'info';
        const confirmText = this.getAttribute('confirm-text') || '확인';
        const cancelText = this.getAttribute('cancel-text') || '취소';

        // variant에 따른 아이콘
        const icons = {
            danger: '!',
            warning: '⚠',
            info: 'ℹ',
        };

        const icon = icons[variant] || icons.info;

        this.innerHTML = `
            <div class="modal modal-confirm ${variant}">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-icon">${icon}</div>
                        <div class="modal-header-text">
                            <h3>${title}</h3>
                            <p>${message}</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary btn-cancel">${cancelText}</button>
                        <button type="button" class="btn btn-primary btn-confirm">${confirmText}</button>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        const overlay = this.querySelector('.modal-overlay');
        const cancelButton = this.querySelector('.btn-cancel');
        const confirmButton = this.querySelector('.btn-confirm');

        // 오버레이 클릭 시 취소
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.handleCancel();
            });
        }

        // 취소 버튼
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.handleCancel();
            });
        }

        // 확인 버튼
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                this.handleConfirm();
            });
        }

        // ESC 키로 취소
        this.handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                this.handleCancel();
            } else if (e.key === 'Enter') {
                this.handleConfirm();
            }
        };
        document.addEventListener('keydown', this.handleKeyDown);
    }

    handleConfirm() {
        if (this.resolvePromise) {
            this.resolvePromise(true);
        }
        this.remove();
    }

    handleCancel() {
        if (this.resolvePromise) {
            this.resolvePromise(false);
        }
        this.remove();
    }

    disconnectedCallback() {
        // 이벤트 리스너 정리
        if (this.handleKeyDown) {
            document.removeEventListener('keydown', this.handleKeyDown);
        }
    }

    /**
     * Promise를 반환하여 사용자 응답 대기
     * @returns {Promise<boolean>} 확인: true, 취소: false
     */
    waitForResponse() {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }
}

customElements.define('modal-confirm', ModalConfirmComponent);

export default ModalConfirmComponent;
