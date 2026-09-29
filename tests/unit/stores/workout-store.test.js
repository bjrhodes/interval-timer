import { beforeEach, describe, expect, it, vi } from 'vitest';
import { seedWorkouts } from '../../../js/src/stores/seed-workouts.js';
import { isWorkout, upgrade, workout } from '../../../js/src/stores/workout-store.js';
import { effort } from '../../../js/src/utilities/effort.js';
import { memoryDb } from '../../../js/src/utilities/idb.js';

// jsdom has no IndexedDB, so seed a memory database the way `upgrade` seeds a real one.
const seededDb = () => {
    const records = [];
    upgrade({ createObjectStore: () => ({ put: (w) => records.push(w) }) }, 0);
    return memoryDb({ workouts: records });
};

// just the parts of the Factory the store uses.
const factoryWith = (db, reportError = vi.fn()) => ({
    database: () => Promise.resolve(db),
    errorReporter: () => reportError,
});

const newWorkout = () => ({
    id: 'workout-1',
    title: 'Test workout',
    effortMode: 'power',
    intervals: [{ action: 'Go', time: 30, unit: 'seconds', effort: 300 }],
});

describe('workout store', () => {
    let db, store;

    beforeEach(() => {
        db = seededDb();
        store = workout({}, factoryWith(db));
    });

    describe('getWorkouts', () => {
        it('returns the seed library in order', async () => {
            const ids = (await store.getWorkouts()).map((w) => w.id);
            expect(ids).toEqual(seedWorkouts.map((w) => w.id));
        });

        it('keeps its ordering to itself', async () => {
            (await store.getWorkouts()).forEach((w) => expect(w).not.toHaveProperty('order'));
        });

        it('returns copies, so callers cannot change the stored workouts', async () => {
            const workouts = await store.getWorkouts();
            workouts[0].title = 'Changed';
            workouts.pop();

            const again = await store.getWorkouts();
            expect(again[0].title).toBe(seedWorkouts[0].title);
            expect(again).toHaveLength(seedWorkouts.length);
        });
    });

    describe('getWorkout', () => {
        it('finds a workout by id', async () => {
            const found = await store.getWorkout('threshold-ladder');
            expect(found.title).toBe('Threshold Ladder');
            expect(found).not.toHaveProperty('order');
        });

        it('returns false for an unknown id', async () => {
            expect(await store.getWorkout('does-not-exist')).toBe(false);
        });

        it('returns a copy, so nested changes are not stored', async () => {
            (await store.getWorkout('threshold-ladder')).intervals[0].action = 'Changed';
            expect((await store.getWorkout('threshold-ladder')).intervals[0].action).toBe('Warmup');
        });
    });

    describe('saveWorkout', () => {
        it('adds a new workout to the end of the library', async () => {
            await store.saveWorkout(newWorkout());

            const workouts = await store.getWorkouts();
            expect(workouts).toHaveLength(seedWorkouts.length + 1);
            expect(workouts[workouts.length - 1]).toEqual(newWorkout());
        });

        it('replaces an existing workout in place', async () => {
            const ids = (await store.getWorkouts()).map((w) => w.id);
            const updated = await store.getWorkout('threshold-ladder');
            updated.title = 'Renamed';
            await store.saveWorkout(updated);

            expect((await store.getWorkout('threshold-ladder')).title).toBe('Renamed');
            expect((await store.getWorkouts()).map((w) => w.id)).toEqual(ids);
        });

        it('stores a copy taken when called, so later changes by the caller are not saved', async () => {
            const saved = newWorkout();
            const saving = store.saveWorkout(saved);
            saved.title = 'Changed while saving';
            await saving;

            expect((await store.getWorkout('workout-1')).title).toBe('Test workout');
        });

        it('persists, so a new store over the same database sees the change', async () => {
            await store.saveWorkout(newWorkout());

            const reopened = workout({}, factoryWith(db));
            expect(await reopened.getWorkout('workout-1')).toEqual(newWorkout());
        });

        it('saves in the order it was called', async () => {
            const first = newWorkout(), second = newWorkout();
            second.title = 'Second';
            await Promise.all([store.saveWorkout(first), store.saveWorkout(second)]);

            expect((await store.getWorkout('workout-1')).title).toBe('Second');
        });

        it('is seen by reads made before the save has finished', async () => {
            const updated = {...newWorkout(), id: 'threshold-ladder', title: 'Renamed'};
            store.saveWorkout(updated);

            expect((await store.getWorkout('threshold-ladder')).title).toBe('Renamed');
            expect((await store.getWorkouts())[4].title).toBe('Renamed');
        });

        it('appends new workouts saved at the same time in the order they were saved', async () => {
            await Promise.all(['a', 'b', 'c'].map((id) => store.saveWorkout({...newWorkout(), id})));

            expect((await store.getWorkouts()).slice(-3).map((w) => w.id)).toEqual(['a', 'b', 'c']);
        });
    });

    describe('deleteWorkout', () => {
        it('removes the workout', async () => {
            await store.deleteWorkout('threshold-ladder');

            expect(await store.getWorkout('threshold-ladder')).toBe(false);
            expect(await store.getWorkouts()).toHaveLength(seedWorkouts.length - 1);
        });

        it('does not bring the seed back once everything is deleted', async () => {
            await Promise.all(seedWorkouts.map((w) => store.deleteWorkout(w.id)));

            expect(await workout({}, factoryWith(db)).getWorkouts()).toEqual([]);
        });
    });

    describe('exportWorkouts', () => {
        it('wraps every workout in a versioned envelope', async () => {
            const data = await store.exportWorkouts();

            expect(data.version).toBe(1);
            expect(new Date(data.exportedAt).toISOString()).toBe(data.exportedAt);
            expect(data.workouts).toEqual(seedWorkouts);
        });
    });

    describe('importWorkouts', () => {
        it('adds new workouts to the end and replaces matching ones in place', async () => {
            const renamed = {...seedWorkouts[1], title: 'Renamed'};
            const result = await store.importWorkouts({ version: 1, workouts: [newWorkout(), renamed] });

            expect(result).toEqual({ imported: 2, skipped: 0 });
            const workouts = await store.getWorkouts();
            expect(workouts[1].title).toBe('Renamed');
            expect(workouts[workouts.length - 1]).toEqual(newWorkout());
            expect(workouts).toHaveLength(seedWorkouts.length + 1);
        });

        it('round-trips an export into an empty library', async () => {
            const data = await store.exportWorkouts();
            const empty = workout({}, factoryWith(memoryDb({ workouts: [] })));
            await empty.importWorkouts(data);

            expect(await empty.getWorkouts()).toEqual(seedWorkouts);
        });

        it('skips workouts that are not valid', async () => {
            const noUnit = {...newWorkout(), id: 'bad', intervals: [{ action: 'Go', time: 30 }]};
            const result = await store.importWorkouts({ version: 1, workouts: [newWorkout(), noUnit, null] });

            expect(result).toEqual({ imported: 1, skipped: 2 });
            expect(await store.getWorkout('bad')).toBe(false);
        });

        it.each([
            ['nothing', undefined],
            ['a bare array', [newWorkout()]],
            ['an object without workouts', { version: 1 }],
        ])('rejects %s', async (name, data) => {
            await expect(store.importWorkouts(data)).rejects.toThrow('not an interval timer export');
        });

        it('rejects a file from a newer version', async () => {
            await expect(store.importWorkouts({ version: 2, workouts: [] })).rejects.toThrow('newer version');
        });
    });

    describe('when the database cannot be opened', () => {
        it('reports it and works from the seed in memory', async () => {
            const reportError = vi.fn();
            const fallback = workout({}, {
                database: () => Promise.reject(new Error('blocked')),
                errorReporter: () => reportError,
            });

            await fallback.saveWorkout(newWorkout());
            expect(await fallback.getWorkouts()).toHaveLength(seedWorkouts.length + 1);
            expect(reportError).toHaveBeenCalledWith(expect.stringContaining('blocked'));
        });
    });

    describe('isWorkout', () => {
        it.each([
            ['no id', {...newWorkout(), id: ''}],
            ['no intervals', {...newWorkout(), intervals: undefined}],
            ['a zero length interval', {...newWorkout(), intervals: [{ time: 0, unit: 'seconds' }]}],
            ['an unknown unit', {...newWorkout(), intervals: [{ time: 5, unit: 'days' }]}],
        ])('rejects a workout with %s', (name, w) => {
            expect(isWorkout(w)).toBe(false);
        });

        it('accepts a workout with no intervals yet', () => {
            expect(isWorkout({...newWorkout(), intervals: []})).toBe(true);
        });
    });

    describe('seed data', () => {
        const units = ['seconds', 'minutes', 'hours'];

        it('has unique ids', () => {
            const ids = seedWorkouts.map((w) => w.id);
            expect(new Set(ids).size).toBe(ids.length);
        });

        it.each(seedWorkouts.map((w) => [w.id, w]))('%s is well formed', (id, w) => {
            expect(isWorkout(w)).toBe(true);
            expect(w.title).toBeTruthy();
            expect(effort.modes.map((m) => m.id)).toContain(w.effortMode);
            expect(w.intervals.length).toBeGreaterThan(0);

            w.intervals.forEach((interval) => {
                expect(interval.action).toBeTruthy();
                expect(interval.time).toBeGreaterThan(0);
                expect(units).toContain(interval.unit);
                if (interval.effort !== undefined) {
                    // a valid effort survives parsing unchanged.
                    expect(effort.parse(w.effortMode, interval.effort)).toBe(interval.effort);
                }
            });
        });
    });
});
