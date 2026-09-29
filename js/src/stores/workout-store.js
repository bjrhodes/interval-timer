import { memoryDb } from '../utilities/idb.js';
import { seedWorkouts } from './seed-workouts.js';

const STORE = 'workouts';
// the version of the export format; bump it with the database version when the workout shape changes.
const VERSION = 1;
const UNITS = ['seconds', 'minutes', 'hours'];

// `order` keeps library order, as IndexedDB hands records back sorted by id.
const seeded = () => seedWorkouts.map((workout, order) => ({...workout, order}));

// `order` is the store's business, so it never leaves it.
const unordered = (workout) => {
    const copy = {...workout};
    delete copy.order;
    return copy;
};

// Creates the schema and seeds a new database.
// @extend migrate older workouts here as their shape changes, e.g. nested intervals.
export const upgrade = (db, oldVersion) => {
    if (oldVersion < 1) {
        const workouts = db.createObjectStore(STORE, { keyPath: 'id' });
        seeded().forEach((workout) => workouts.put(workout));
    }
};

// Light checks only: enough that an imported workout can't break the views.
export const isWorkout = (workout) => {
    return !!workout && typeof workout.id === 'string' && workout.id !== '' &&
        Array.isArray(workout.intervals) &&
        workout.intervals.every((interval) => !!interval && interval.time > 0 && UNITS.includes(interval.unit));
};

export const workout = (state, factory) => {
    const reportError = factory.errorReporter();

    const db = factory.database().catch((error) => {
        reportError('Workouts cannot be stored in this browser, so changes will be lost on reload. ' + error);
        return memoryDb({ [STORE]: seeded() });
    });

    // one write at a time, so each sees the library as the last one left it; reads wait for them too, so a view
    // opened straight after an edit still sees it.
    let writes = Promise.resolve();
    const queued = (fn) => {
        const write = writes.then(fn);
        writes = write.catch(() => {});
        return write;
    };

    const all = () => db
        .then((d) => d.getAll(STORE))
        .then((workouts) => workouts.sort((a, b) => a.order - b.order));

    // keeps an existing workout in its place in the library, or adds a new one to the end.
    const place = (workout, library) => {
        const index = library.findIndex((w) => w.id === workout.id);
        if (index === -1) {
            const order = library.reduce((max, w) => Math.max(max, w.order), -1) + 1;
            library.push({...workout, order});
        } else {
            library[index] = {...workout, order: library[index].order};
        }
        return library.find((w) => w.id === workout.id);
    };

    return {
        getWorkouts: () => writes.then(all).then((workouts) => workouts.map(unordered)),
        getWorkout: (id) => writes
            .then(() => db)
            .then((d) => d.get(STORE, id))
            .then((workout) => workout ? unordered(workout) : false),
        saveWorkout: (workout) => {
            // copied now, so the caller can keep editing while this is saved.
            const saved = structuredClone(workout);
            return queued(() => all().then((library) => db.then((d) => d.put(STORE, place(saved, library)))));
        },
        deleteWorkout: (id) => queued(() => db.then((d) => d.delete(STORE, id))),
        exportWorkouts: () => writes.then(all).then((workouts) => ({
            version: VERSION,
            exportedAt: new Date().toISOString(),
            workouts: workouts.map(unordered),
        })),
        // merges by id: workouts that are already stored are replaced, new ones are added, and none are removed.
        importWorkouts: (data) => {
            if (!data || !Array.isArray(data.workouts)) {
                return Promise.reject(new Error('This file is not an interval timer export.'));
            }
            if (data.version > VERSION) {
                return Promise.reject(new Error('This file was exported by a newer version of the app.'));
            }
            const valid = data.workouts.filter(isWorkout);
            return queued(() => all()
                .then((library) => db.then((d) => d.putAll(STORE, valid.map((w) => place(unordered(w), library))))))
                .then(() => ({ imported: valid.length, skipped: data.workouts.length - valid.length }));
        },
    };
};
