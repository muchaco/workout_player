import eventBus from '../eventBus';
import { globalStore } from '../stateManager';

let loadingCounter = 0;

const updateSpinner = () => {
    globalStore.set('show_spinner', loadingCounter !== 0);
};

eventBus.on('loading', () => {
    console.log('loading');
    loadingCounter += 1;
    updateSpinner();
});

eventBus.on('loaded', () => {
    console.log('loaded');
    loadingCounter -= 1;
    updateSpinner();
});
