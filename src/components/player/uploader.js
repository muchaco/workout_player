import eventBus from '../../eventBus.js';
import BaseComponent from '../../utils/baseComponent.js';
import {
    getFromStorageByIndex,
    listLocalStorageElements,
} from '../../utils/localStorage.js';
import { setWorkout } from '../../utils/uploader.js';
import FileInput from './fileInput.js';

class Uploader extends BaseComponent {
    props = {
        workouts: listLocalStorageElements(),
    };
    eventListeners = [
        {
            selector: '#upload',
            event: 'click',
            callback: () => {
                eventBus.put('upload');
            },
        },
        {
            selector: 'ul',
            event: 'click',
            callback: (event) => {
                if (event.target && event.target.nodeName === 'LI') {
                    const index = Array.prototype.indexOf.call(
                        event.target.parentNode.children,
                        event.target
                    );
                    const workout = getFromStorageByIndex(index);
                    setWorkout({
                        excercises: workout.excercises,
                        name: workout.workout_name,
                        description: workout.workout_description,
                    });
                }
            },
        },
        {
            event: 'storage-changed',
            callback: () => {
                this.props.workouts = listLocalStorageElements();
            },
        },
    ];
    components = [{ type: FileInput, selector: '#c-file-input' }];

    html() {
        return `
            <div class="overlay">
                <div class="overlay-content">
                <h3>Select a workout to play</h3>
                <hr>
                    <p>
                        <button class="w3-button w3-round w3-theme-l2" id="upload">Upload workout</button>
                    </p
                        ${
                            this.props.workouts.length > 0
                                ? '<p>Or select a previously saved workout</p>'
                                : ''
                        }
                        <ul class="w3-ul w3-hoverable">
                        ${this.props.workouts
                            .map(
                                (workout) => `
                                <li>${workout.workout_name}</li>
                            `
                            )
                            .join('')}
                        </ul>
                </div>
            </div>
            <div id="c-file-input"></div>
        `;
    }

    style() {
        return `
            li {
                cursor: pointer;
            }
        `;
    }
}

export default Uploader;
