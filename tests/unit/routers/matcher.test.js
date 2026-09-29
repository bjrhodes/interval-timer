import { describe, expect, it } from 'vitest';
import { Matcher } from '../../../js/src/routers/matcher.js';
import { routes } from './routes.js';

describe('Matcher', () => {
    const matcher = Matcher(routes());

    describe('findRoute', () => {
        it.each([
            ['', 'workouts'],
            ['timer', 'timer'],
            ['timer/threshold-ladder', 'timer'],
            ['editworkout', 'edit-workout'],
            ['editworkout/threshold-ladder', 'edit-workout'],
        ])('matches "%s" to %s', (hash, id) => {
            expect(matcher.findRoute(hash).id).toBe(id);
        });

        it('falls back to the empty route for anything unknown', () => {
            expect(matcher.findRoute('not-a-real-page').id).toBe('workouts');
        });

        it('matches the route already being shown, so its parameters can change', () => {
            expect(matcher.findRoute('timer/another-workout').id).toBe('timer');
        });

        it('does not reorder the routes it was given', () => {
            const given = routes();
            Matcher(given);
            expect(given.map((r) => r.id)).toEqual(['workouts', 'timer', 'edit-workout']);
        });
    });

    describe('parameters', () => {
        it('splits a path on slashes', () => {
            expect(matcher.parameters('timer/threshold-ladder')).toEqual(['timer', 'threshold-ladder']);
        });

        it('returns no parameters for anything that is not a string', () => {
            expect(matcher.parameters(undefined)).toEqual([]);
        });
    });
});
