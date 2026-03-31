import { events } from "./constants.js";

export default class Events {


    static onTrainingComplete(callback) {
        document.addEventListener(events.trainingComplete, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTrainingComplete(data) {
        const event = new CustomEvent(events.trainingComplete, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onRecommend(callback) {
        document.addEventListener(events.recommend, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchRecommend(data) {
        const event = new CustomEvent(events.recommend, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onRecommendationsReady(callback) {
        document.addEventListener(events.recommendationsReady, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchRecommendationsReady(data) {
        const event = new CustomEvent(events.recommendationsReady, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTrainModel(callback) {
        document.addEventListener(events.modelTrain, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTrainModel(data) {
        const event = new CustomEvent(events.modelTrain, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisLogs(callback) {
        document.addEventListener(events.tfvisLogs, (event) => {
            return callback(event.detail);
        });
    }

    static dispatchTFVisLogs(data) {
        const event = new CustomEvent(events.tfvisLogs, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onTFVisorData(callback) {
        document.addEventListener(events.tfvisData, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchTFVisorData(data) {
        const event = new CustomEvent(events.tfvisData, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onProgressUpdate(callback) {
        document.addEventListener(events.modelProgressUpdate, (event) => {
            return callback(event.detail);
        });
    }

    static dispatchProgressUpdate(progressData) {
        const event = new CustomEvent(events.modelProgressUpdate, {
            detail: progressData
        });
        document.dispatchEvent(event);
    }


    static onUserSelected(callback) {
        document.addEventListener(events.userSelected, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchUserSelected(data) {
        const event = new CustomEvent(events.userSelected, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onUsersUpdated(callback) {
        document.addEventListener(events.usersUpdated, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchUsersUpdated(data) {
        const event = new CustomEvent(events.usersUpdated, {
            detail: data
        });
        document.dispatchEvent(event);
    }


    static onPurchaseAdded(callback) {
        document.addEventListener(events.purchaseAdded, (event) => {
            return callback(event.detail);
        });
    }
    static dispatchPurchaseAdded(data) {
        const event = new CustomEvent(events.purchaseAdded, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onPurchaseRemoved(callback) {
        document.addEventListener(events.purchaseRemoved, (event) => {
            return callback(event.detail);
        });
    }

    static dispatchEventPurchaseRemoved(data) {
        const event = new CustomEvent(events.purchaseRemoved, {
            detail: data
        });
        document.dispatchEvent(event);
    }

    static onProgressUpdate(callback) {
        document.addEventListener(events.modelProgressUpdate, (event) => {
            return callback(event.detail);
        });
    }
}