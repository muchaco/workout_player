import { globalStore } from '../stateManager.js';

function currentExcercise() {
    return globalStore.excercises[globalStore.current_index];
}

export default currentExcercise;
