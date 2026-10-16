import { guided } from '../plans/guided.ts';
import { memoryDb, type Upgrade } from '../utilities/idb.ts';
import type { Plan, StoreDeps } from '../types.ts';

type Stored = Plan & {id: string};

const STORE = 'plan';
// one guided plan at a time, in the one record.
const ID = 'plan';

export const upgrade: Upgrade = (db, oldVersion) => {
    if (oldVersion < 3) {
        db.createObjectStore(STORE, { keyPath: 'id' });
    }
};

export const plan = (state: unknown, factory: StoreDeps) => {
    const reportError = factory.errorReporter();

    const db = factory.database().catch((error) => {
        reportError('Your plan cannot be stored in this browser, so it will be lost on reload. ' + error);
        return memoryDb({ [STORE]: [] });
    });

    // as the workout store: one write at a time, and reads wait for them.
    let writes: Promise<unknown> = Promise.resolve();
    const queued = <T>(fn: () => T | Promise<T>) => {
        const write = writes.then(fn);
        writes = write.catch(() => {});
        return write;
    };

    // null until a guided plan is started.
    const get = () => writes
        .then(() => db)
        .then((d) => d.get<Stored>(STORE, ID))
        .then((saved): Plan | null => saved || null);

    const put = (saved: Plan) => db.then((d) => d.put(STORE, {...structuredClone(saved), id: ID}));

    return {
        get: get,
        save: (saved: Plan) => {
            const copy = structuredClone(saved);
            return queued(() => put(copy));
        },
        getWorkout: (id: string) => get().then((saved) => (saved && guided.workout(saved, id)) || false),
        // read and written in one turn of the queue, so two sessions finished together both count.
        complete: (id: string) => queued(() => db
            .then((d) => d.get<Stored>(STORE, ID))
            .then((saved) => saved && !saved.completed.includes(id)
                ? put(guided.complete(saved, id))
                : undefined)),
    };
};
