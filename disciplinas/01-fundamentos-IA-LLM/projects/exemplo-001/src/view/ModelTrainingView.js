import { View } from './View.js';

export class ModelView extends View {
    #trainModelBtn = document.querySelector('#trainModelBtn');
    #purchasesArrow = document.querySelector('#purchasesArrow');
    #purchasesDiv = document.querySelector('#purchasesDiv');
    #allUsersPurchasesList = document.querySelector('#allUsersPurchasesList');
    #runRecommendationBtn = document.querySelector('#runRecommendationBtn');
    #onTrainModel;
    #onRunRecommendation;

    constructor() {
        super();
        this.attachEventListeners();
    }

    registerTrainModelCallback(callback) {
        this.#onTrainModel = callback;
    }
    registerRunRecommendationCallback(callback) {
        this.#onRunRecommendation = callback;
    }

    attachEventListeners() {
        this.#trainModelBtn.addEventListener('click', () => {
            this.#onTrainModel();
        });
        this.#runRecommendationBtn.addEventListener('click', () => {
            this.#onRunRecommendation();
        });

        this.#purchasesDiv.addEventListener('click', () => {
            const purchasesList = this.#allUsersPurchasesList;

            const isHidden = window.getComputedStyle(purchasesList).display === 'none';

            if (isHidden) {
                purchasesList.style.display = 'block';
                this.#purchasesArrow.classList.remove('bi-chevron-down');
                this.#purchasesArrow.classList.add('bi-chevron-up');
            } else {
                purchasesList.style.display = 'none';
                this.#purchasesArrow.classList.remove('bi-chevron-up');
                this.#purchasesArrow.classList.add('bi-chevron-down');
            }
        });

    }
    enableRecommendButton() {
        this.#runRecommendationBtn.disabled = false;
    }
    updateTrainingProgress(progress) {
        this.#trainModelBtn.disabled = true;
        this.#trainModelBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Training...';

        if (progress.progress === 100) {
            this.#trainModelBtn.disabled = false;
            this.#trainModelBtn.innerHTML = 'Train Recommendation Model';
        }
    }

    renderAllUsersPurchases(users) {
        const html = users.map(user => {
            const purchasesHtml = user.purchases.map(purchase => {
                return `<span class="badge bg-light text-dark me-1 mb-1">${purchase.name}</span>`;
            }).join('');

            return `
                <div class="user-purchase-summary">
                    <h6>${user.name} (Age: ${user.age})</h6>
                    <div class="purchases-badges">
                        ${purchasesHtml || '<span class="text-muted">No purchases</span>'}
                    </div>
                </div>
            `;
        }).join('');

        this.#allUsersPurchasesList.innerHTML = html;
    }
}
