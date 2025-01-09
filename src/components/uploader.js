import eventBus from '../eventBus.js';
import BaseComponent from '../utils/baseComponent.js';
import FileInput from './fileinput.js';

class Uploader extends BaseComponent {
    eventListeners = [
        {
            selector: '#upload',
            event: 'click',
            callback: () => {
                eventBus.put('upload');
            },
        },
    ];
    components = [{ type: FileInput, selector: '#c-file-input' }];

    html() {
        return `
            <div class="overlay">
                <div class="overlay-content">
                    <p>
                        <button class="w3-button w3-round w3-theme-l2" id="upload">Upload workout</button>
                    </p>
                </div>
            </div>
            <div id="c-file-input"></div>
        `;
    }
}

export default Uploader;
