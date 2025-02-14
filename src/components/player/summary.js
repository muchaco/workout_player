import { marked } from 'marked';
import eventBus from '../../eventBus.js';
import { globalStore } from '../../stateManager.js';
import BaseComponent from '../../utils/baseComponent.js';
import literal from '../../utils/literal.js';
import {
    listLocalStorageElements,
    removeFromLocalStorage,
    saveToLocalStorage,
} from '../../utils/localStorage.js';
class Summary extends BaseComponent {
    props = {
        saved: false,
        qrCode: null,
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
            selector: '#qrcode',
            event: 'click',
            callback: async () => {
                const response = await this.uploadJson({
                    excercises: globalStore.excercises,
                    name: globalStore.workout_name,
                    description: globalStore.workout_description,
                    schema_version: globalStore.schema_version,
                });

                if (response.status === literal.success) {
                    let fileUrl = response.data.url;
                    fileUrl = fileUrl.replace(
                        'https://tmpfiles.org/',
                        'https://tmpfiles.org/dl/'
                    );
                    const workoutUrl =
                        'http://localhost:5173/?workout_url=' + fileUrl;
                    this.props.qrCode = `https://quickchart.io/qr?text=${workoutUrl}`;
                } else {
                    eventBus.put('toast', [
                        'error',
                        'Errorduring QR code generation',
                    ]);
                }
            },
        },
        {
            event: 'control',
            callback: (operation) => {
                if (operation === literal.finish) {
                    globalStore.set('finished', true);
                }
            },
        },
    ];
    subscriptions = ['workout_name', 'workout_description'];

    connectedCallback() {
        this.inLocalStorage = 0;
    }

    async uploadJson(jsonData) {
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
            type: 'application/json',
        });

        const formData = new FormData();
        formData.append('file', blob, 'data.json');

        const response = await fetch('https://tmpfiles.org/api/v1/upload', {
            method: 'POST',
            body: formData,
        });

        return response.json();
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
                    <p>
                        <button class="w3-button w3-round w3-theme-l2" id="start">${startLabel}</button>
                        <button class="w3-button w3-round w3-theme-l2" id="select">Select another workout</button>
                        <button class="w3-button w3-round w3-theme-l2" id="${
                            saved ? 'remove' : 'save'
                        }">${
                            saved ? 'Remove from storage' : 'Save to storage'
                        }</button>
                        <button class="w3-button w3-round w3-theme-l2" id="qrcode">QR code</button>
                        ${this.props.qrCode ? `<div id="qrcode-container"><img src="${this.props.qrCode}" /></div>` : ''}
                    </p>
                </div>
            </div>
        `;
    }
}

export default Summary;
