import { describe, expect, it } from 'vitest';
import { Matcher } from '../../../src/routers/matcher.ts';
import { routes } from './routes.ts';
import type { Route } from '../../../src/types.ts';

describe('Matcher', () => {
    const matcher = Matcher(routes());
    // every hash here has a route, so `findRoute` never gives back false.
    const idOf = (hash: string) => (matcher.findRoute(hash) as Route).id;

    describe('findRoute', () => {
        it.each([
            ['', 'workouts'],
            ['timer', 'timer'],
            ['timer/threshold-ladder', 'timer'],
            ['editworkout', 'edit-workout'],
            ['editworkout/threshold-ladder', 'edit-workout'],
        ])('matches "%s" to %s', (hash, id) => {
            expect(idOf(hash)).toBe(id);
        });

        it('falls back to the empty route for anything unknown', () => {
            expect(idOf('not-a-real-page')).toBe('workouts');
        });

        it('matches the route already being shown, so its parameters can change', () => {
            expect(idOf('timer/another-workout')).toBe('timer');
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
