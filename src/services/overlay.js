import { globalStore } from '../stateManager';

let overlayEvents = ['show_summary', 'show_uploader'];

globalStore.subscribe(overlayEvents, (key, value) => {
    if (value) {
        for (let overlayEvent of overlayEvents) {
            if (overlayEvent !== key) {
                globalStore.set(overlayEvent, false);
            }
        }
    }
});
