import { describe, expect, it } from 'vitest';
import { Factory } from '../../js/src/Factory.js';
import { enumerable } from '../../js/src/utilities/enumerable.js';

describe('Factory', () => {
    const factory = () => Factory({ basePath: '/', routes: enumerable([]) }, {}, document);

    describe('store', () => {
        it('hands every caller the same store', () => {
            const f = factory();
            expect(f.store('workout')).toBe(f.store('workout'));
        });

        // jsdom has no IndexedDB, so this runs against the store's in-memory fallback.
        it('shares saved changes between callers, e.g. the edit and list views', async () => {
            const f = factory();
            const edited = await f.store('workout').getWorkout('threshold-ladder');
            edited.title = 'Renamed';
            await f.store('workout').saveWorkout(edited);

            expect((await f.store('workout').getWorkout('threshold-ladder')).title).toBe('Renamed');
        });

        it('keeps separate factories separate', () => {
            expect(factory().store('workout')).not.toBe(factory().store('workout'));
        });
    });

    describe('database', () => {
        it('opens one connection for every caller', () => {
            const f = factory();
            const db = f.database();
            db.catch(() => {});
            expect(f.database()).toBe(db);
        });
    });
});
