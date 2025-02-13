import BaseComponent from '../../utils/baseComponent.js';

class Spinner extends BaseComponent {
    html() {
        return `
            <div id="loading">
                <div id="loader"></div>
            </div>
        `;
    }

    style() {
        return `
            @keyframes spin {
                0% {
                    transform: rotate(360deg);
                }

                100% {
                    transform: rotate(0deg);
                }
            }

            #loading {
                position: fixed;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                background: #fff;
                z-index: 9999;
            }

            #loader {
                left: 50%;
                margin-left: -4em;
                font-size: 10px;
                border: .8em solid rgba(218, 219, 223, 1);
                border-left: .8em solid rgba(58, 166, 165, 1);
                animation: spin 1.1s infinite linear;
            }

            #loader, #loader:after {
                border-radius: 50%;
                width: 8em;
                height: 8em;
                display: block;
                position: absolute;
                top: 50%;
                margin-top: -4.05em;
            }
        `;
    }
}

export default Spinner;
