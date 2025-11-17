/**
 * Modal Input Web Component
 * 텍스트 입력 모달 컴포넌트
 * 글자수 카운터, 실시간 검증 기능 포함
 * 스타일: /css/components/modal.css, /css/components/modal-input.css
 */

import { validateCommentContent } from '../utils/validators.js';

class ModalInputComponent extends HTMLElement {
    constructor() {
        super();
        this.resolvePromise = null;
        this.currentValue = '';
        this.maxLength = 500;
    }

    connectedCallback() {
        this.maxLength = parseInt(this.getAttribute('max-length') || '500', 10);
        this.currentValue = this.getAttribute('initial-value') || '';
        this.render();
        this.attachEventListeners();
        // 포커스를 textarea로 이동
        setTimeout(() => {
            const textarea = this.querySelector('textarea');
            if (textarea) {
                textarea.focus();
                // 커서를 끝으로 이동
                textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            }
        }, 100);
    }

    render() {
        const title = this.getAttribute('title') || '입력';
        const placeholder = this.getAttribute('placeholder') || '내용을 입력하세요';

        this.innerHTML = `
            <div class="modal modal-input">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <h3>${title}</h3>
                    <div class="modal-body">
                        <div class="input-wrapper">
                            <textarea
                                placeholder="${placeholder}"
                                maxlength="${this.maxLength}"
                            >${this.currentValue}</textarea>
                        </div>
                        <div class="char-counter">
                            <span class="helper-text">내용을 입력하세요</span>
                            <span class="count"><span class="current">0</span>/<span class="max">${this.maxLength}</span></span>
                        </div>
                        <div class="error-message"></div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary btn-cancel">취소</button>
                        <button type="button" class="btn btn-primary btn-confirm">확인</button>
                    </div>
                </div>
            </div>
        `;

        // 초기 검증
        setTimeout(() => this.validateInput(), 0);
    }

    attachEventListeners() {
        const overlay = this.querySelector('.modal-overlay');
        const cancelButton = this.querySelector('.btn-cancel');
        const confirmButton = this.querySelector('.btn-confirm');
        const textarea = this.querySelector('textarea');

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

        // textarea 입력 이벤트
        if (textarea) {
            textarea.addEventListener('input', () => {
                this.validateInput();
            });
        }

        // ESC 키로 취소
        this.handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                this.handleCancel();
            }
        };
        document.addEventListener('keydown', this.handleKeyDown);
    }

    validateInput() {
        const textarea = this.querySelector('textarea');
        const errorMessage = this.querySelector('.error-message');
        const confirmButton = this.querySelector('.btn-confirm');
        const charCounter = this.querySelector('.char-counter');
        const currentCount = this.querySelector('.current');

        if (!textarea || !errorMessage || !confirmButton || !currentCount) {
            return;
        }

        const value = textarea.value.trim();
        const length = value.length;

        // 글자수 업데이트
        currentCount.textContent = length;

        // 글자수 카운터 색상 변경
        charCounter.classList.remove('warning', 'error');
        if (length > this.maxLength) {
            charCounter.classList.add('error');
        } else if (length > this.maxLength * 0.8) {
            charCounter.classList.add('warning');
        }

        // 검증
        const validation = validateCommentContent(value);

        if (!validation.isValid) {
            // 에러 상태
            textarea.classList.add('error');
            errorMessage.textContent = validation.message;
            confirmButton.disabled = true;
        } else {
            // 정상 상태
            textarea.classList.remove('error');
            errorMessage.textContent = '';
            confirmButton.disabled = false;
        }
    }

    handleConfirm() {
        const textarea = this.querySelector('textarea');
        const value = textarea ? textarea.value.trim() : '';

        // 최종 검증
        const validation = validateCommentContent(value);
        if (!validation.isValid) {
            return;
        }

        if (this.resolvePromise) {
            this.resolvePromise(value);
        }
        this.remove();
    }

    handleCancel() {
        if (this.resolvePromise) {
            this.resolvePromise(null);
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
     * Promise를 반환하여 사용자 입력 대기
     * @returns {Promise<string|null>} 입력값 또는 null (취소 시)
     */
    waitForResponse() {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }
}

customElements.define('modal-input', ModalInputComponent);

export default ModalInputComponent;
