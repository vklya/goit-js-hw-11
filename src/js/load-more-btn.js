export class LoadMoreBtn {
    constructor({ selector, hidden = false }) {
        this.btn = document.querySelector(selector);

        hidden && this.hide();
    }

    enable() {
        this.btn.disable = false;
    }

    disable() {
        this.btn.disable = true;
    }

    show() {
        this.btn.classList.remove('is-hidden');
    }

    hide() {
        this.btn.classList.add('is-hidden');
    }
}