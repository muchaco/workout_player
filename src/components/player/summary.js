import { marked } from 'marked';
import eventBus from '../../eventBus.js';
import { globalStore } from '../../stateManager.js';
import BaseComponent from '../../utils/baseComponent.js';
import { uploadJson } from '../../utils/fileUploader.js';
import literal from '../../utils/literal.js';
import {
    listLocalStorageElements,
    removeFromLocalStorage,
    saveToLocalStorage,
} from '../../utils/localStorage.js';
import { generateQRCodeUrl } from '../../utils/qrCode.js';

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
            callback: this.handleQRCodeClick.bind(this),
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
        globalStore.subscribe('show_summary', (_, show) => {
            if (!show) {
                this.props.qrCode = null;
            }
        });
    }

    async handleQRCodeClick() {
        if (this.props.qrCode) return;

        const fileUrl = await this.getFileUrl();
        if (!fileUrl) return;

        eventBus.put('loading');
        const workoutUrl = `${window.location.origin}/?workout_url=${fileUrl}`;
        this.props.qrCode = generateQRCodeUrl(workoutUrl);
        eventBus.put('loaded');
    }

    async getFileUrl() {
        const urlParams = new URLSearchParams(location.search);
        const existingUrl = urlParams.get('workout_url');

        if (existingUrl) {
            return existingUrl;
        } else {
            try {
                const fileUrl = await uploadJson({
                    excercises: globalStore.excercises,
                    name: globalStore.workout_name,
                    description: globalStore.workout_description,
                    schema_version: globalStore.schema_version,
                });
                return fileUrl;
            } catch (error) {
                eventBus.put('toast', [
                    'error',
                    'Error during QR code generation',
                ]);
                return null;
            }
        }
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
