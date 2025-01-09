import { marked } from 'marked';
import eventBus from '../eventBus.js';
import { globalStore } from '../stateManager.js';
import BaseComponent from '../utils/baseComponent.js';
import FileInput from './fileInput.js';

class Summary extends BaseComponent {
    components = [{ type: FileInput, selector: '#c-file-input' }];
    eventListeners = [
        {
            selector: '#start',
            event: 'click',
            callback: () => {
                eventBus.put('control', 'start');
                globalStore.set('show_summary', false);
                globalStore.set('finished', false);
            },
        },
        {
            selector: '#upload',
            event: 'click',
            callback: () => {
                eventBus.put('upload');
            },
        },
        {
            event: 'control',
            callback: (operation) => {
                if (operation === 'finish') {
                    globalStore.set('finished', true);
                }
            },
        },
    ];
    subscriptions = ['workout_name', 'workout_description'];

    html() {
        let name = globalStore.workout_name;
        let startLabel = globalStore.finished
            ? 'Restart workout'
            : 'Start workout';
        if (globalStore.finished) {
            name = `${name} finished`;
        }
        return `
            <div class="overlay">
                <div class="overlay-content">
                    <p>${name}</p>
                    ${
                        globalStore.finished
                            ? ''
                            : `<div>${marked.parse(
                                  globalStore.workout_description
                              )}</div>`
                    }
                    <p>
                        <button class="w3-button w3-round w3-theme-l2" id="start">${startLabel}</button>
                        <button class="w3-button w3-round w3-theme-l2" id="upload">Upload another workout</button>
                    <p>
                </div>
            </div>
            <div id="c-file-input"></div>
        `;
    }
}

export default Summary;
