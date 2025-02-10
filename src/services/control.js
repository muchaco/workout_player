import eventBus from '../eventBus';
import startCountdown from '../services/countdown.js';
import { globalStore } from '../stateManager';

eventBus.on('control', (action) => {
    if (action === 'pause') {
        globalStore.set('is_paused', true);
    } else if (action === 'resume') {
        globalStore.set('is_paused', false);
    } else if (action === 'start') {
        globalStore.set('is_paused', false);
        eventBus.put('jump_to_excercise', 0);
    } else if (action === 'finish') {
        globalStore.set('is_paused', true);
        globalStore.set('countdown', null);
        globalStore.set('_countdown', null);
        globalStore.set('current_index', null);
        globalStore.set('progressbar_counter', null);
        globalStore.set('show_summary', true);
    }
});

eventBus.on('countdown_finished', () => {
    if (globalStore.current_index === globalStore.excercises.length - 1) {
        eventBus.put('control', 'finish');
        return;
    }
    eventBus.put('jump_to_excercise', globalStore.current_index + 1);
});

eventBus.on('jump_to_excercise', (id) => {
    const currentExcercise = globalStore.excercises[id];
    if (currentExcercise.countdown) {
        globalStore.set('progressbar_counter', currentExcercise.countdown);
        startCountdown(currentExcercise.countdown);
    }
    globalStore.set('current_index', id);
});

document.addEventListener('keydown', (event) => {
    if (
        globalStore.get('show_uploader') ||
        globalStore.get('show_summary') ||
        globalStore.get('show_spinner')
    ) {
        return;
    }

    // Ignore if the user is typing in an input, textarea, or content-editable element
    if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
    ) {
        return;
    }

    if (event.code === 'Space') {
        event.preventDefault(); // Prevent page scrolling

        const isPaused = globalStore.get('is_paused');
        eventBus.put('control', isPaused ? 'resume' : 'pause');
    }
});
