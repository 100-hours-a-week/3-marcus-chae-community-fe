/**
 * Footer Web Component
 * 페이지 하단 푸터
 */

class FooterComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const currentYear = new Date().getFullYear();

        this.innerHTML = `
            <footer class="site-footer">
                <div class="footer-container">
                    <div class="footer-content">
                        <p class="footer-text">© ${currentYear} Community. All rights reserved.</p>
                        <div class="footer-links">
                            <a href="/terms" class="footer-link" data-link="terms">이용약관</a>
                            <span class="separator">|</span>
                            <a href="/privacy" class="footer-link" data-link="privacy">개인정보처리방침</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    attachEventListeners() {
        const links = this.querySelectorAll('.footer-link');
        links.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const path = link.getAttribute('data-link');
                window.location.href = `/api/v1/${path}`;
            });
        });
    }
}

customElements.define('footer-component', FooterComponent);

export default FooterComponent;
