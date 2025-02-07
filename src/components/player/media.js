import BaseComponent from '../../utils/baseComponent.js';
import currentExcercise from '../../utils/currentExcercise.js';

class Media extends BaseComponent {
    subscriptions = ['excercises', 'current_index'];

    html() {
        const media = currentExcercise()?.media;
        if (media?.startsWith('http') || media?.startsWith('data:')) {
            return `<img src="${media}" alt="media">`;
        }
        return media ? media : '';
    }

    style() {
        return `
            img, video {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
        `;
    }
}

export default Media;
