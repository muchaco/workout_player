import { globalStore } from '../stateManager.js';
import BaseComponent from '../utils/baseComponent.js';

class Progressbar extends BaseComponent {
    props = {
        progress: 0,
    };
    subscriptions = ['progressbar_counter', 'is_paused'];
    eventListeners = [
        {
            event: 'control',
            callback: (action) => {
                if (action === 'pause') {
                    let width = window.getComputedStyle(
                        document.querySelector(this.getSelector('#progressbar'))
                    ).width;
                    this.props.progress = width;
                }
            },
        },
        {
            event: 'jump_to_excercise',
            callback: (_) => {
                this.props.progress = 0;
            },
        },
    ];
    html() {
        return `<div class="w3-theme-d2" id="progressbar"></div>`;
    }

    style() {
        if (globalStore.progressbar_counter == null) {
            return '';
        } else {
            const outerElement = document.querySelector(this.getSelector());
            let widthPercent;

            const innerWidth = this.props.progress;
            const outerWidth = window.getComputedStyle(outerElement).width;
            widthPercent = (parseInt(innerWidth) / parseInt(outerWidth)) * 100;

            const remainingProgress =
                ((100 - widthPercent) * globalStore.progressbar_counter) / 100;
            return `
                @keyframes fillProgress {
                    from {
                        width: ${widthPercent}%; /* Start with no width */
                    }
                    to {
                        width: 100%; /* End with full width */
                    }
                }

                #progressbar {
                    width: ${
                        this.props.progress
                    };           /* Start with no progress */
                    height: 100%;      /* Full height of the bar */
                    ${
                        globalStore.is_paused
                            ? ''
                            : `animation: fillProgress ${remainingProgress}s linear forwards;`
                    } /* Animation details */
                    border-radius: 5px 0 0 5px; /* Match container radius for smooth edges */
                }
            `;
        }
    }
}

export default Progressbar;
