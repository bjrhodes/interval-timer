import { memoryDb } from '../utilities/idb.js';

const STORE = 'preferences';
// every preference lives in the one record.
const ID = 'preferences';

export const upgrade = (db, oldVersion) => {
    if (oldVersion < 2) {
        db.createObjectStore(STORE, { keyPath: 'id' });
    }
};

export const preferences = (state, factory) => {
    const reportError = factory.errorReporter();

    const db = factory.database().catch((error) => {
        reportError('Preferences cannot be stored in this browser, so changes will be lost on reload. ' + error);
        return memoryDb({ [STORE]: [] });
    });

    // as the workout store: one write at a time, and reads wait for them.
    let writes = Promise.resolve();

    return {
        get: () => writes
            .then(() => db)
            .then((d) => d.get(STORE, ID))
            .then((prefs) => prefs || { id: ID }),
        save: (prefs) => {
            const saved = {...structuredClone(prefs), id: ID};
            const write = writes.then(() => db).then((d) => d.put(STORE, saved));
            writes = write.catch(() => {});
            return write;
        },
    };
};
