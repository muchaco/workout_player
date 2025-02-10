import { createStore } from './stateManager';

const eventBusStore = createStore();

const eventBus = {
    on(key, callback) {
        eventBusStore.subscribe(key, (_key, value) => {
            callback(value.message);
        });
    },
    async put(key, message = null) {
        const _message = {
            message: message,
            _: Math.random(),
        };
        eventBusStore.set(key, _message);
    },
};

export default eventBus;
