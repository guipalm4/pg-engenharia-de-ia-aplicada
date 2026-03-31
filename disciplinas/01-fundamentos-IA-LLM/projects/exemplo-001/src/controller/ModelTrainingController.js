export class ModelController {
    #modelView;
    #userService;
    #events;
    #currentUser = null;
    #alreadyTrained = false;
    constructor({
        modelView,
        userService,
        events,
    }) {
        this.#modelView = modelView;
        this.#userService = userService;
        this.#events = events;

        this.init();
    }

    static init(deps) {
        return new ModelController(deps);
    }

    async init() {
        this.setupCallbacks();
    }

    setupCallbacks() {
        this.#modelView.registerTrainModelCallback(this.handleTrainModel.bind(this));
        this.#modelView.registerRunRecommendationCallback(this.handleRunRecommendation.bind(this));

        this.#events.onUserSelected((user) => {
            this.#currentUser = user;
            if (!this.#alreadyTrained) return
            this.#modelView.enableRecommendButton();
        });

        this.#events.onTrainingComplete(() => {
            this.#alreadyTrained = true;
            if (!this.#currentUser) return
            this.#modelView.enableRecommendButton();
        })

        this.#events.onUsersUpdated(
            async (...data) => {
                return this.refreshUsersPurchaseData(...data);
            }
        );
        this.#events.onProgressUpdate(
            (progress) => {
                this.handleTrainingProgressUpdate(progress);
            }
        );

    }


    async handleTrainModel() {
        const users = await this.#userService.getUsers();

        this.#events.dispatchTrainModel(users);
    }

    handleTrainingProgressUpdate(progress) {
        this.#modelView.updateTrainingProgress(progress);
    }
    async handleRunRecommendation() {
        const currentUser = this.#currentUser;
        const updatedUser = await this.#userService.getUserById(currentUser.id);
        this.#events.dispatchRecommend(updatedUser);
    }

    async refreshUsersPurchaseData({ users }) {
        this.#modelView.renderAllUsersPurchases(users);
    }
}
