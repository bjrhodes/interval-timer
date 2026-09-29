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

        it('shares saved changes between callers, e.g. the edit and list views', () => {
            const f = factory();
            const edited = f.store('workout').getWorkout('threshold-ladder');
            edited.title = 'Renamed';
            f.store('workout').saveWorkout(edited);

            expect(f.store('workout').getWorkout('threshold-ladder').title).toBe('Renamed');
        });

        it('keeps separate factories separate', () => {
            expect(factory().store('workout')).not.toBe(factory().store('workout'));
        });
    });
});
