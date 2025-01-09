import eventBus from '../eventBus.js';
import { globalStore } from '../stateManager.js';
import BaseComponent from '../utils/baseComponent.js';

class ExcerciseList extends BaseComponent {
    eventListeners = [
        {
            selector: 'ul',
            event: 'click',
            callback: (event) => {
                if (event.target && event.target.nodeName === 'LI') {
                    const index = Array.prototype.indexOf.call(
                        event.target.parentNode.children,
                        event.target
                    );
                    eventBus.put('jump_to_excercise', index);
                }
            },
        },
    ];
    subscriptions = ['excercises', 'current_index'];

    html() {
        const getTitle = (excercise) => {
            return excercise.type === 'excercise'
                ? `${excercise.name} (${
                      excercise.countdown || excercise.repetition
                  } ${excercise.countdown ? 'sec' : 'reps'})`
                : `Rest (${excercise.countdown} sec)`;
        };

        return `
            <ul class="w3-ul w3-hoverable">
                ${globalStore.excercises
                    .map(
                        (excercise, i) => `
                            <li class="excercise-name ${
                                i === globalStore.current_index ? 'active' : ''
                            }" id="excercise-${i}">
                                ${getTitle(excercise)}
                            </li>
                        `
                    )
                    .join('')}
            </ul>
        `;
    }

    style() {
        return `
            li.active {
                background-color: #4CAF50;
            }

            li {
                cursor: pointer;
            }
        `;
    }
}

export default ExcerciseList;
