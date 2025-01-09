import eventBus from '../eventBus';
import { globalStore } from '../stateManager';
import flattenNestedCSS from './cssProcessor';
class BaseComponent {
    id;
    components = [];
    eventListeners = [];
    subscriptions = [];
    props = {};

    constructor(selector) {
        this._selector = selector;
        this.id = Math.random().toString(36).substring(2, 11);

        Promise.resolve().then(() => {
            this.#onInit();
        });
    }

    #onInit() {
        this.#bindProps();
        this.#createComponents();
        this.#addGlobalEventListeners();
        this.connectedCallback();
    }

    connectedCallback() {
        // called after initialized the component
    }

    #bindProps() {
        this.props = new Proxy(this.props, {
            set: (target, key, value) => {
                target[key] = value;
                this.#_render();
                return true;
            },
        });

        globalStore.subscribe(this.subscriptions, () => {
            this.#_render();
        });
    }

    #createComponents() {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i] = new this.components[i].type(
                this.getSelector(this.components[i].selector)
            );
        }
    }

    #observeAttributes() {
        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName != 'data-id'
                ) {
                    this.#_render();
                }
            });
        });

        const element = document.querySelector(this.getSelector());
        if (element) {
            observer.observe(element, {
                attributes: true,
            });
        }
    }

    getSelector(slctr) {
        if (slctr) {
            return this._selector + ' ' + slctr;
        } else {
            return this._selector;
        }
    }

    html() {
        return ``;
    }

    style() {
        return ``;
    }

    #_render() {
        Promise.resolve().then(() => {
            const element = document.querySelector(this.getSelector());
            if (!element) return;

            element.setAttribute('data-id', this.id);

            let html = this.html();
            let style = this.style();

            if (style !== '') {
                style = `[data-id="${this.id}"] { ${style} }`;
                const flattenCss = flattenNestedCSS(style);
                html = `<style>${flattenCss}</style>${html}`;
            }

            element.innerHTML = html;

            this.#renderNestedComponents();
            this.#addDomEventListeners();
            this.#observeAttributes();
            this.renderedCallback();
        });
    }

    render() {
        this.#_render();
    }

    #renderNestedComponents() {
        if (this.components) {
            this.components.forEach((cmp) => {
                cmp.render();
            });
        }
    }

    renderedCallback() {
        // called every time a (re)render happens
    }

    #addDomEventListeners() {
        if (this.eventListeners) {
            this.eventListeners.forEach((listener) => {
                if (listener.selector) {
                    const element = document.querySelector(
                        this.getSelector(listener.selector)
                    );
                    if (element) {
                        element.addEventListener(
                            listener.event,
                            listener.callback
                        );
                    }
                }
            });
        }
    }

    #addGlobalEventListeners() {
        if (this.eventListeners) {
            this.eventListeners.forEach((listener) => {
                if (!listener.selector) {
                    eventBus.on(listener.event, listener.callback);
                }
            });
        }
    }
}

export default BaseComponent;
