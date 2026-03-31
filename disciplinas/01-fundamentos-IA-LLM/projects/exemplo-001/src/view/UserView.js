import { View } from './View.js';

export class UserView extends View {
    #userSelect = document.querySelector('#userSelect');
    #userAge = document.querySelector('#userAge');
    #pastPurchasesList = document.querySelector('#pastPurchasesList');

    #purchaseTemplate;
    #onUserSelect;
    #onPurchaseRemove;
    #pastPurchaseElements = [];

    constructor() {
        super();
        this.init();
    }

    async init() {
        this.#purchaseTemplate = await this.loadTemplate('./src/view/templates/past-purchase.html');
        this.attachUserSelectListener();
    }

    registerUserSelectCallback(callback) {
        this.#onUserSelect = callback;
    }

    registerPurchaseRemoveCallback(callback) {
        this.#onPurchaseRemove = callback;
    }

    renderUserOptions(users) {
        const options = users.map(user => {
            return `<option value="${user.id}">${user.name}</option>`;
        }).join('');

        this.#userSelect.innerHTML += options;
    }

    renderUserDetails(user) {
        this.#userAge.value = user.age;
    }

    renderPastPurchases(pastPurchases) {
        if (!this.#purchaseTemplate) return;

        if (!pastPurchases || pastPurchases.length === 0) {
            this.#pastPurchasesList.innerHTML = '<p>No past purchases found.</p>';
            return;
        }

        const html = pastPurchases.map(product => {
            return this.replaceTemplate(this.#purchaseTemplate, {
                ...product,
                product: JSON.stringify(product)
            });
        }).join('');

        this.#pastPurchasesList.innerHTML = html;
        this.attachPurchaseClickHandlers();
    }

    addPastPurchase(product) {

        if (this.#pastPurchasesList.innerHTML.includes('No past purchases found')) {
            this.#pastPurchasesList.innerHTML = '';
        }

        const purchaseHtml = this.replaceTemplate(this.#purchaseTemplate, {
            ...product,
            product: JSON.stringify(product)
        });

        this.#pastPurchasesList.insertAdjacentHTML('afterbegin', purchaseHtml);

        const newPurchase = this.#pastPurchasesList.firstElementChild.querySelector('.past-purchase');
        newPurchase.classList.add('past-purchase-highlight');

        setTimeout(() => {
            newPurchase.classList.remove('past-purchase-highlight');
        }, 1000);

        this.attachPurchaseClickHandlers();
    }

    attachUserSelectListener() {
        this.#userSelect.addEventListener('change', (event) => {
            const userId = event.target.value ? Number(event.target.value) : null;

            if (userId) {
                if (this.#onUserSelect) {
                    this.#onUserSelect(userId);
                }
            } else {
                this.#userAge.value = '';
                this.#pastPurchasesList.innerHTML = '';
            }
        });
    }

    attachPurchaseClickHandlers() {
        this.#pastPurchaseElements = [];

        const purchaseElements = document.querySelectorAll('.past-purchase');

        purchaseElements.forEach(purchaseElement => {
            this.#pastPurchaseElements.push(purchaseElement);

            purchaseElement.onclick = (event) => {

                const product = JSON.parse(purchaseElement.dataset.product);
                const userId = this.getSelectedUserId();
                const element = purchaseElement.closest('.col-md-6');

                this.#onPurchaseRemove({ element, userId, product });

                element.style.transition = 'opacity 0.5s ease';
                element.style.opacity = '0';

                setTimeout(() => {
                    element.remove();

                    if (document.querySelectorAll('.past-purchase').length === 0) {
                        this.renderPastPurchases([]);
                    }

                }, 500);

            }
        });
    }

    getSelectedUserId() {
        return this.#userSelect.value ? Number(this.#userSelect.value) : null;
    }
}
