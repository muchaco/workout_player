import eventBus from '../eventBus';

const STORAGE_KEY = 'myApp_storageList';

/**
 * Save a value into local storage list
 * @param {string} value - The value to save
 */
export function saveToLocalStorage(value) {
    let storageList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    storageList.push(value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageList));
    eventBus.put('storage-changed');
}

/**
 * Remove a value from local storage list by index
 * @param {number} index - The index of the value to remove
 */
export function removeFromLocalStorage(index) {
    let storageList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (index >= 0 && index < storageList.length) {
        storageList.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageList));
    }
    eventBus.put('storage-changed');
}

/**
 * List all elements saved in the local storage list
 * @returns {Array<string>} - An array of values
 */
export function listLocalStorageElements() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

export function getFromStorageByIndex(index) {
    let storageList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return storageList[index];
}
