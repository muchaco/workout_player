import eventBus from '../eventBus.js';
import { globalStore } from '../stateManager.js';
import playSound from '../utils/sound.js';

let countdownInterval = null;

globalStore.subscribe(['_countdown', 'countdown'], (key, value) => {
    if (key === '_countdown') {
        if (value % 100 === 0) {
            globalStore.set('countdown', value / 100);
        }
    } else if (key === 'countdown') {
        if (value <= 0) {
            playSound('gong');
            clearInterval(countdownInterval);
            eventBus.put('countdown_finished');
        } else if (value <= 4) {
            playSound('click');
        }
    }
});

function start(countdown) {
    clearInterval(countdownInterval);
    globalStore.set('_countdown', countdown * 100);
    if (!globalStore.is_paused) {
        control('resume');
    }
}

function control(operation) {
    if (operation === 'resume') {
        countdownInterval = setInterval(() => {
            globalStore.set('_countdown', globalStore._countdown - 1);
        }, 10);
    }
    if (operation === 'pause' || operation === 'finish') {
        clearInterval(countdownInterval);
    }
}

eventBus.on('control', control);

export default start;
