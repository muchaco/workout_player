import eventBus from '../eventBus.js';
import '../services/control.js';
import '../services/loading.js';
import '../services/overlay.js';
import { globalStore } from '../stateManager.js';
import BaseComponent from '../utils/baseComponent.js';
import { validateJson } from '../utils/uploader.js';
import Controller from './controller.js';
import ExcerciseDescription from './excerciseDescription.js';
import ExcerciseList from './excerciseList.js';
import ExcerciseNumber from './excerciseNumber.js';
import Media from './media.js';
import Progressbar from './progressbar.js';
import Spinner from './spinner.js';
import Summary from './summary.js';
import Uploader from './uploader.js';

class Player extends BaseComponent {
    components = [
        { type: Spinner, selector: '#c-spinner' },
        { type: ExcerciseList, selector: '#c-excercise-list' },
        { type: Progressbar, selector: '#c-progressbar' },
        { type: Media, selector: '#c-excercise-media' },
        { type: Controller, selector: '#c-controller' },
        { type: Uploader, selector: '#c-uploader' },
        { type: Summary, selector: '#c-summary' },
        { type: ExcerciseNumber, selector: '#c-excercise-number' },
        { type: ExcerciseDescription, selector: '#c-excercise-description' },
    ];

    eventListeners = [
        {
            event: 'warning',
            callback: (message) => {
                alert(message);
            },
        },
    ];
    subscriptions = ['show_summary', 'show_uploader', 'show_spinner'];

    async connectedCallback() {
        // initialize the global store
        globalStore.set('excercises', []);
        globalStore.set('show_uploader', true);

        const url_params = new URLSearchParams(location.search);
        const json_url = url_params.get('workout_url');
        if (json_url) {
            eventBus.put('loading');
            const response = await fetch(json_url);
            if (!response.ok) {
                throw new Error(
                    `Error loading JSON file: ${response.statusText}`
                );
            }
            const json = await response.json();
            validateJson(json);
        }
    }

    html() {
        return `
            ${globalStore.show_summary ? ' <div id="c-summary"></div>' : ''}
            ${globalStore.show_uploader ? '<div id="c-uploader"></div>' : ''}
            ${globalStore.show_spinner ? '<div id="c-spinner"></div>' : ''}
            <div class="container w3-theme">
                <div class="w3-row row-1 w3-text-theme">
                <div class="w3-col l3 col-1 w3-theme-l3">
                    <div class="w3-row w3-middle row-2 w3-theme-d1">
                        <div id="c-excercise-number" class="w3-col middle"></div>
                    </div>
                    <div id="c-excercise-description" class="w3-row row-3 w3-theme-d3"></div>
                </div>
                <div class="w3-col l6 col-4 w3-theme-d5">
                    <div class="w3-row row-4 w3-theme-d4">
                        <div id="c-excercise-media" class="w3-col middle">
                        </div>
                    </div>
                    <div id="c-progressbar" class="w3-row row-5"></div>
                </div>
                <div id="c-excercise-list" class="w3-col l3 col-5 w3-theme-l1"></div>
                </div>
                <div class="w3-row row-5 w3-theme-d3 w3-padding" id="c-controller">
                </div>
            </div>
        `;
    }

    style() {
        return `
            .container {
                width: 1200px;
                height: 100%;
                margin: 0 auto;
                box-shadow: 0 0 20px #0006;
                border-left: 2px solid rgb(65,65,65);
                border-right: 2px solid rgb(65,65,65)
            }

            .row-1 {
                height: calc(100% - 60px)
            }

            .col-1 {
                height: 100%
            }

            .row-2 {
                height: 150px;
                font-size: 75pt
            }

            .row-3 {
                height: calc(100% - 150px);
                border-top: 2px solid rgb(65,65,65);
                overflow-y: scroll;
                padding: 15px
            }

            .col-4 {
                height: 100%;
                border-left: 2px solid rgb(65,65,65);
                border-right: 2px solid rgb(65,65,65)
            }

            .row-4 {
                height: calc(100% - 60px)
            }

            .row-5 {
                border-top: 2px solid rgb(65,65,65);
                height: 60px
            }

            .col-5 {
                height: 100%;
                overflow-y: scroll
            }

            .middle {
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center
            }
        `;
    }
}

export default Player;
