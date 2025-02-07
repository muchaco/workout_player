import { globalStore } from '../../stateManager.js';
import BaseComponent from '../../utils/baseComponent.js';
import currentExcercise from '../../utils/currentExcercise.js';

class ExcerciseNumber extends BaseComponent {
    subscriptions = ['countdown', 'current_index', 'excercises'];

    html() {
        let excercise_number = '';
        if (currentExcercise()?.countdown != null)
            excercise_number = globalStore.countdown;
        else if (currentExcercise()?.repetition != null)
            excercise_number = currentExcercise().repetition;

        return `${excercise_number}`;
    }
}

export default ExcerciseNumber;
