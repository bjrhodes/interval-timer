import { memoryDb, type Upgrade } from '../utilities/idb.ts';
import type { Preferences, StoreDeps } from '../types.ts';

const STORE = 'preferences';
// every preference lives in the one record.
const ID = 'preferences';

export const upgrade: Upgrade = (db, oldVersion) => {
    if (oldVersion < 2) {
        db.createObjectStore(STORE, { keyPath: 'id' });
    }
};

export const preferences = (state: unknown, factory: StoreDeps) => {
    const reportError = factory.errorReporter();

    const db = factory.database().catch((error) => {
        reportError('Preferences cannot be stored in this browser, so changes will be lost on reload. ' + error);
        return memoryDb({ [STORE]: [] });
    });

    // as the workout store: one write at a time, and reads wait for them.
    let writes: Promise<unknown> = Promise.resolve();

    return {
        get: () => writes
            .then(() => db)
            .then((d) => d.get<Preferences & {id: string}>(STORE, ID))
            .then((prefs): Preferences => prefs || { id: ID }),
        save: (prefs: Preferences) => {
            const saved = {...structuredClone(prefs), id: ID};
            const write = writes.then(() => db).then((d) => d.put(STORE, saved));
            writes = write.catch(() => {});
            return write;
        },
    };
};
