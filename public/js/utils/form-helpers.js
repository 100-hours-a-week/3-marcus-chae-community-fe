/**
 * 폼 관련 헬퍼 함수들
 * 입력 필드 에러 표시 및 관리를 위한 유틸리티
 */

/**
 * 입력 필드에 에러 메시지 표시
 * @param {string} inputId - 입력 필드의 id
 * @param {string} message - 표시할 에러 메시지
 */
export function showInputError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) {
        console.warn(`Input with id "${inputId}" not found`);
        return;
    }

    const inputBlock = input.closest('.input-block');
    if (!inputBlock) {
        console.warn(`Input "${inputId}" is not inside an .input-block`);
        return;
    }

    const errorMessage = inputBlock.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    input.classList.add('error');
}

/**
 * 입력 필드의 에러 메시지 숨김
 * @param {string} inputId - 입력 필드의 id
 */
export function hideInputError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) {
        return;
    }

    const inputBlock = input.closest('.input-block');
    if (!inputBlock) {
        return;
    }

    const errorMessage = inputBlock.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    input.classList.remove('error');
}

/**
 * 폼의 모든 에러 메시지 초기화
 * @param {HTMLFormElement|string} formOrId - 폼 요소 또는 폼의 id
 */
export function clearFormErrors(formOrId) {
    const form = typeof formOrId === 'string' ? document.getElementById(formOrId) : formOrId;

    if (!form) {
        console.warn('Form not found');
        return;
    }

    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach((error) => {
        error.textContent = '';
        error.style.display = 'none';
    });

    const errorInputs = form.querySelectorAll('input.error');
    errorInputs.forEach((input) => {
        input.classList.remove('error');
    });
}

/**
 * 입력 필드 값 설정
 * @param {string} inputId - 입력 필드의 id
 * @param {string} value - 설정할 값
 */
export function setInputValue(inputId, value) {
    const input = document.getElementById(inputId);
    if (input) {
        input.value = value;
    }
}

/**
 * 입력 필드 값 가져오기
 * @param {string} inputId - 입력 필드의 id
 * @returns {string} 입력 값
 */
export function getInputValue(inputId) {
    const input = document.getElementById(inputId);
    return input ? input.value : '';
}

/**
 * 폼 리셋 (값 초기화 + 에러 메시지 제거)
 * @param {HTMLFormElement|string} formOrId - 폼 요소 또는 폼의 id
 */
export function resetForm(formOrId) {
    const form = typeof formOrId === 'string' ? document.getElementById(formOrId) : formOrId;

    if (!form) {
        console.warn('Form not found');
        return;
    }

    form.reset();
    clearFormErrors(form);
}
