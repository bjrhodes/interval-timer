import { guided } from '../plans/guided.js';
import { memoryDb } from '../utilities/idb.js';

const STORE = 'plan';
// one guided plan at a time, in the one record.
const ID = 'plan';

export const upgrade = (db, oldVersion) => {
    if (oldVersion < 3) {
        db.createObjectStore(STORE, { keyPath: 'id' });
    }
};

export const plan = (state, factory) => {
    const reportError = factory.errorReporter();

    const db = factory.database().catch((error) => {
        reportError('Your plan cannot be stored in this browser, so it will be lost on reload. ' + error);
        return memoryDb({ [STORE]: [] });
    });

    // as the workout store: one write at a time, and reads wait for them.
    let writes = Promise.resolve();
    const queued = (fn) => {
        const write = writes.then(fn);
        writes = write.catch(() => {});
        return write;
    };

    // null until a guided plan is started.
    const get = () => writes
        .then(() => db)
        .then((d) => d.get(STORE, ID))
        .then((saved) => saved || null);

    const put = (saved) => db.then((d) => d.put(STORE, {...structuredClone(saved), id: ID}));

    return {
        get: get,
        save: (saved) => {
            const copy = structuredClone(saved);
            return queued(() => put(copy));
        },
        getWorkout: (id) => get().then((saved) => (saved && guided.workout(saved, id)) || false),
        // read and written in one turn of the queue, so two sessions finished together both count.
        complete: (id) => queued(() => db
            .then((d) => d.get(STORE, ID))
            .then((saved) => saved && !saved.completed.includes(id)
                ? put({...saved, completed: saved.completed.concat([id])})
                : undefined)),
    };
};
