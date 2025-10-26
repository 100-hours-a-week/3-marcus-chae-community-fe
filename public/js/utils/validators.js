/**
 * 유효성 검증 유틸리티
 * 재사용 가능한 검증 함수들을 제공합니다.
 */

/**
 * 이메일 유효성 검증
 * @param {string} email - 검증할 이메일
 * @returns {Object} { isValid: boolean, message: string }
 */
export function validateEmail(email) {
    if (!email || email.trim() === '') {
        return {
            isValid: false,
            message: '이메일을 입력해주세요.',
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    return {
        isValid,
        message: isValid ? '' : '올바른 이메일 형식이 아닙니다.',
    };
}

/**
 * 비밀번호 유효성 검증
 * 8-20자, 대문자/소문자/숫자/특수문자 각 1개 이상
 * @param {string} password - 검증할 비밀번호
 * @returns {Object} { isValid: boolean, message: string }
 */
export function validatePassword(password) {
    if (!password) {
        return {
            isValid: false,
            message: '비밀번호를 입력해주세요.',
        };
    }

    // 8-20자, 대문자/소문자/숫자/특수문자 각 1개 이상, 앞뒤 공백 불허
    const passwordRegex =
        /^(?!\s)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}(?<!\s)$/;
    const isValid = passwordRegex.test(password);

    return {
        isValid,
        message: isValid ? '' : '8-20자, 대문자/소문자/숫자/특수문자 각 1개 이상 포함해야 합니다.',
    };
}

/**
 * 비밀번호 확인 검증
 * @param {string} password - 원본 비밀번호
 * @param {string} passwordConfirm - 확인 비밀번호
 * @returns {Object} { isValid: boolean, message: string }
 */
export function validatePasswordConfirm(password, passwordConfirm) {
    if (!passwordConfirm) {
        return {
            isValid: false,
            message: '비밀번호 확인을 입력해주세요.',
        };
    }

    const isValid = password === passwordConfirm;

    return {
        isValid,
        message: isValid ? '' : '비밀번호가 일치하지 않습니다.',
    };
}

/**
 * 닉네임 유효성 검증
 * @param {string} nickname - 검증할 닉네임
 * @returns {Object} { isValid: boolean, message: string }
 */
export function validateNickname(nickname) {
    if (!nickname || nickname.trim() === '') {
        return {
            isValid: false,
            message: '닉네임을 입력해주세요.',
        };
    }

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 1 || trimmedNickname.length > 10) {
        return {
            isValid: false,
            message: '닉네임은 1자 이상 10자 이하로 입력해주세요.',
        };
    }

    return {
        isValid: true,
        message: '',
    };
}
