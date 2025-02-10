import eventBus from '../../eventBus.js';
import { globalStore } from '../../stateManager.js';
import BaseComponent from '../../utils/baseComponent.js';

class Controller extends BaseComponent {
    subscriptions = ['is_paused', 'current_index', 'excercises'];

    eventListeners = [
        {
            selector: '#menu-pause',
            event: 'click',
            callback: () => {
                if (globalStore.is_paused) return;
                eventBus.put('control', 'pause');
            },
        },
        {
            selector: '#menu-play',
            event: 'click',
            callback: () => {
                if (!globalStore.is_paused) return;
                eventBus.put('control', 'resume');
            },
        },
        {
            selector: '#menu-previous',
            event: 'click',
            callback: () => {
                if (globalStore.current_index === 0) return;
                eventBus.put(
                    'jump_to_excercise',
                    globalStore.current_index - 1
                );
            },
        },
        {
            selector: '#menu-next',
            event: 'click',
            callback: () => {
                if (
                    globalStore.current_index ===
                    globalStore.excercises.length - 1
                ) {
                    return;
                }
                eventBus.put(
                    'jump_to_excercise',
                    globalStore.current_index + 1
                );
            },
        },
        {
            selector: '#menu-restart-workout',
            event: 'click',
            callback: () => {
                eventBus.put('control', 'start');
                eventBus.put('jump_to_excercise', 0);
            },
        },
        {
            selector: '#menu-finish',
            event: 'click',
            callback: () => {
                eventBus.put('control', 'finish');
            },
        },
        {
            selector: '#menu-restart-excercise',
            event: 'click',
            callback: () => {
                eventBus.put('jump_to_excercise', globalStore.current_index);
            },
        },
    ];

    html() {
        return `
            <div class="w3-bar w3-center">
                <button class="w3-button w3-round w3-theme-l2" title="Jump to start" id="menu-restart-workout">
                    <i class="fas fa-backward-fast"></i>
                </button>
                <button class="w3-button w3-round w3-theme-l2 ${
                    globalStore.current_index === 0 ? 'w3-disabled' : ''
                }" title="Previous excercise" id="menu-previous">
                    <i class="fa-solid fa-backward-step"></i>
                </button>
                <button class="w3-button w3-round w3-theme-l2" title="restart excercise" id="menu-restart-excercise">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
                <button class="w3-button w3-round w3-theme-l2 ${
                    globalStore.is_paused ? 'w3-hide' : ''
                }" title="Pause" id="menu-pause">
                    <i class="fa-solid fa-pause"></i>
                </button>
                <button class="w3-button w3-round w3-theme-l2 ${
                    globalStore.is_paused ? '' : 'w3-hide'
                }" title="Resume" id="menu-play">
                    <i class="fa-solid fa-play"></i>
                </button>
                <button class="w3-button w3-round w3-theme-l2 ${
                    globalStore.current_index ===
                    globalStore.excercises.length - 1
                        ? 'w3-disabled'
                        : ''
                }" title="Next excercise" id="menu-next">
                    <i class="fa-solid fa-forward-step"></i>
                </button>
                <button class="w3-button w3-round w3-theme-l2" title="Finish" id="menu-finish">
                    <i class="fa-solid fa-stop"></i>
                </button>
            </div>
        `;
    }
}

export default Controller;
