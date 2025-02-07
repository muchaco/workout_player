import BaseComponent from '../../utils/baseComponent.js';
import { handleFileUpload } from '../../utils/uploader.js';

class FileInput extends BaseComponent {
    eventListeners = [
        {
            event: 'upload',
            callback: () => {
                let element = document.querySelector(
                    this.getSelector('#file-upload')
                );
                if (element) element.click();
            },
        },
        {
            selector: '#file-upload',
            event: 'change',
            callback: handleFileUpload,
        },
    ];

    html() {
        return `
            <input type="file" id="file-upload" accept=".json" class="w3-hide">
        `;
    }
}

export default FileInput;
