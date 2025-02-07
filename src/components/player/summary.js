import { marked } from 'marked';
import eventBus from '../../eventBus.js';
import { globalStore } from '../../stateManager.js';
import BaseComponent from '../../utils/baseComponent.js';
import {
    listLocalStorageElements,
    removeFromLocalStorage,
    saveToLocalStorage,
} from '../../utils/localStorage.js';

class Summary extends BaseComponent {
    props = {
        saved: false,
    };
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
            selector: '#select',
            event: 'click',
            callback: () => {
                globalStore.set('show_uploader', true);
            },
        },
        {
            selector: '#remove',
            event: 'click',
            callback: () => {
                this.props.saved = false;
                removeFromLocalStorage(this.inLocalStorage - 1);
                this.inLocalStorage = 0;
            },
        },
        {
            selector: '#save',
            event: 'click',
            callback: () => {
                if (this.props.saved) return;
                saveToLocalStorage({
                    workout_name: globalStore.workout_name,
                    excercises: globalStore.excercises,
                    workout_description: globalStore.workout_description,
                });
                this.props.saved = true;
                eventBus.put('toast', ['info', 'save done']);
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

    connectedCallback() {
        this.inLocalStorage = 0;
    }

    html() {
        let name = globalStore.workout_name;
        let startLabel = globalStore.finished
            ? 'Restart workout'
            : 'Start workout';
        if (globalStore.finished) {
            name = `${name} finished`;
        }
        let saved = false;

        if (!this.props.saved) {
            const elements = listLocalStorageElements();
            for (let index = 0; index < elements.length; index++) {
                const workout = elements[index];
                if (
                    workout.workout_name === globalStore.workout_name &&
                    workout.workout_description ===
                        globalStore.workout_description &&
                    JSON.stringify(workout.excercises) ===
                        JSON.stringify(globalStore.excercises)
                ) {
                    this.inLocalStorage = index + 1;
                    break;
                }
            }
        }

        if (this.props.saved || this.inLocalStorage) {
            saved = true;
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
                    <p><button class="w3-button w3-round w3-theme-l2" id="start">${startLabel}</button>
                    <button class="w3-button w3-round w3-theme-l2" id="select">Select another workout</button>
                    <button class="w3-button w3-round w3-theme-l2" id="${
                        saved ? 'remove' : 'save'
                    }">${
                        saved ? 'Remove from storage' : 'Save to storage'
                    }</button></p>
                </div>
            </div>
        `;
    }
}

export default Summary;
