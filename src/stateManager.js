/**
 * createStore
 * Creates and returns a new store object, with:
 *  - get: returns a specific key
 *  - set: updates a specific key
 *  - subscribe: subscribe to changes for given keys
 *  - unsubscribe: unsubscribe from changes
 */
export function createStore(initialState = {}) {
    let state = { ...initialState };
    const store = {
        get,
        set,
        subscribe,
    };

    // Map of key => Set of callbacks
    // Each callback is only triggered when that key updates.
    const subscribers = new Map();

    // Single callback set that fires on *any* update (optional).
    const generalSubscribers = new Set();

    /**
     * Returns the current value at the specified key.
     */
    function get(key) {
        return state[key];
    }

    /**
     * Sets the value of a key and notifies subscribers for that key.
     */
    async function set(key, value) {
        const nativeProperties = Object.keys(store);
        if (nativeProperties.includes(key)) {
            throw new Error(`Cannot set value for native property: ${key}`);
        }
        if (state[key] === value) return; // No change
        state[key] = value;
        notify(key);
    }

    /**
     * Notifies all subscribers relevant to a particular key,
     * plus any general subscribers that track all updates.
     */
    function notify(changedKey) {
        // Notify subscribers of the changedKey
        if (subscribers.has(changedKey)) {
            for (const cb of subscribers.get(changedKey)) {
                cb(changedKey, state[changedKey]);
            }
        }

        // Notify general subscribers
        for (const cb of generalSubscribers) {
            cb(changedKey, state[changedKey]);
        }
    }

    /**
     * Subscribes a callback to the specified keys:
     *   - keys can be a single string or an array of strings
     *   - pass `'*'` or use subscribeAll() if you want to catch all changes
     * Returns an unsubscribe function.
     */
    function subscribe(keys, callback) {
        if (keys === '*') {
            // Subscribe to all updates
            generalSubscribers.add(callback);
            return () => {
                generalSubscribers.delete(callback);
            };
        }

        // Convert a single key to an array if needed
        const keysArray = Array.isArray(keys) ? keys : [keys];

        // For each key, add the callback
        keysArray.forEach((key) => {
            if (!subscribers.has(key)) {
                subscribers.set(key, new Set());
            }
            subscribers.get(key).add(callback);
        });

        // Return an unsubscribe function that removes these callbacks
        return () => {
            keysArray.forEach((key) => {
                if (subscribers.has(key)) {
                    subscribers.get(key).delete(callback);
                    if (subscribers.get(key).size === 0) {
                        subscribers.delete(key);
                    }
                }
            });
        };
    }

    // Create a proxy to allow dynamic property access
    return new Proxy(store, {
        get(target, prop) {
            if (prop in target) {
                return target[prop];
            }
            return target.get(prop);
        },
    });
}

/**
 * Example: A default (global) store
 */
export const globalStore = createStore();
