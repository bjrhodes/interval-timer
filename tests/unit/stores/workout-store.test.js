import { beforeEach, describe, expect, it } from 'vitest';
import { workout } from '../../../js/src/stores/workout-store.js';
import { effort } from '../../../js/src/utilities/effort.js';
import { enumerable } from '../../../js/src/utilities/enumerable.js';
import { tools } from '../../../js/src/utilities/tools.js';

// just the parts of the Factory the store uses.
const factory = {
    tools: () => tools,
    enumerable: enumerable,
};

describe('workout store', () => {
    let store;

    beforeEach(() => {
        store = workout({}, factory);
    });

    describe('getWorkouts', () => {
        it('returns the seeded workouts', () => {
            const workouts = store.getWorkouts();
            expect(workouts.length).toBeGreaterThan(0);
            expect(workouts.map((w) => w.id)).toContain('over-unders-3-2-3-2');
        });

        it('returns copies, so callers cannot change the store', () => {
            store.getWorkouts()[0].title = 'Changed';
            store.getWorkouts().pop();

            const again = store.getWorkouts();
            expect(again[0].title).not.toBe('Changed');
            expect(again).toHaveLength(store.getWorkouts().length);
        });
    });

    describe('getWorkout', () => {
        it('finds a workout by id', () => {
            const found = store.getWorkout('threshold-ladder');
            expect(found.title).toBe('Threshold Ladder');
            expect(found.effortMode).toBe('hrZone');
        });

        it('returns false for an unknown id', () => {
            expect(store.getWorkout('does-not-exist')).toBe(false);
        });

        it('returns a copy, so callers cannot change the store', () => {
            store.getWorkout('threshold-ladder').intervals[0].action = 'Changed';
            expect(store.getWorkout('threshold-ladder').intervals[0].action).toBe('Warmup');
        });
    });

    describe('saveWorkout', () => {
        const newWorkout = () => ({
            id: 'workout-1',
            title: 'Test workout',
            effortMode: 'power',
            intervals: [{ action: 'Go', time: 30, unit: 'seconds', effort: 300 }],
        });

        it('adds a new workout', () => {
            const count = store.getWorkouts().length;
            store.saveWorkout(newWorkout());

            expect(store.getWorkouts()).toHaveLength(count + 1);
            expect(store.getWorkout('workout-1')).toEqual(newWorkout());
        });

        it('replaces an existing workout in place', () => {
            const ids = store.getWorkouts().map((w) => w.id);
            const updated = store.getWorkout('threshold-ladder');
            updated.title = 'Renamed';
            store.saveWorkout(updated);

            expect(store.getWorkout('threshold-ladder').title).toBe('Renamed');
            expect(store.getWorkouts().map((w) => w.id)).toEqual(ids);
        });

        it('stores a copy, so later changes by the caller are not saved', () => {
            const saved = newWorkout();
            store.saveWorkout(saved);
            saved.title = 'Changed after save';

            expect(store.getWorkout('workout-1').title).toBe('Test workout');
        });
    });

    describe('seed data', () => {
        const units = ['seconds', 'minutes', 'hours'];
        const workouts = workout({}, factory).getWorkouts();

        it('has unique ids', () => {
            const ids = workouts.map((w) => w.id);
            expect(new Set(ids).size).toBe(ids.length);
        });

        it.each(workouts.map((w) => [w.id, w]))('%s is well formed', (id, w) => {
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
