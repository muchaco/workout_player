import { marked } from 'marked';
import BaseComponent from '../utils/baseComponent.js';
import currentExcercise from '../utils/currentExcercise.js';

class ExcerciseDescription extends BaseComponent {
    subscriptions = ['excercises', 'current_index'];

    html() {
        let description = null;
        try {
            description = currentExcercise().description;
        } catch (error) {
            // pass
        }
        return `${description == null ? '' : marked.parse(description)}`;
    }
}

export default ExcerciseDescription;
