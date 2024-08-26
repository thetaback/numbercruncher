import { BaseAuthStore } from './node_modules/pocketbase/dist/pocketbase.es.mjs';

/**
 * The token store for browsers using sessionStorage
 */
export class PerTabAuthStore extends BaseAuthStore {
    constructor(storageKey = "pocketbase_auth") {
        super();

        this.storageKey = storageKey;

        this._bindStorageEvent();
    }

    get token() {
        const data = this._storageGet(this.storageKey) || {};

        return data.token || "";
    }

    get model() {
        const data = this._storageGet(this.storageKey) || {};

        return data.model || null;
    }

    save(token, model) {
        this._storageSet(this.storageKey, {
            token: token,
            model: model,
        });

        super.save(token, model);
    }

    clear() {
        this._storageRemove(this.storageKey);

        super.clear();
    }

    // ---------------------------------------------------------------
    // Internal helpers:
    // ---------------------------------------------------------------

    /**
     * Retrieves `key` from the browser's session storage
     */
    _storageGet(key) {
        const rawValue = window.sessionStorage.getItem(key) || "";
        try {
            return JSON.parse(rawValue);
        } catch (e) {
            return rawValue;
        }
    }

    /**
     * Stores a new data in the browser's session storage
     */
    _storageSet(key, value) {
        // store in local storage
        let normalizedVal = value;
        if (typeof value !== "string") {
            normalizedVal = JSON.stringify(value);
        }
        window.sessionStorage.setItem(key, normalizedVal);
    }

    /**
     * Removes `key` from the browser's local storage and the runtime/memory.
     */
    _storageRemove(key) {
        // delete from session storage
        window.sessionStorage.removeItem(key);
    }

    /**
     * Updates the current store state on localStorage change.
     */
    _bindStorageEvent() {
        window.addEventListener("storage", (e) => {
            if (e.key != this.storageKey) {
                return;
            }

            const data = this._storageGet(this.storageKey) || {};

            super.save(data.token || "", data.model || null);
        });
    }
}
