import { describe, expect, it } from 'vitest';
import { enumerable } from '../../../src/utilities/enumerable.ts';

// for searches the test knows will match.
const found = <T>(result: T | false) => result as T;

const people = () => enumerable([
    { id: 'b', name: 'Bea' },
    { id: 'c', name: 'Cal' },
    { id: 'a', name: 'Ash' },
]);

describe('enumerable', () => {
    it('decorates and returns the same array', () => {
        const arr: unknown[] = [];
        expect(enumerable(arr)).toBe(arr);
    });

    describe('searchBy', () => {
        it('finds the first item with a matching key', () => {
            expect(people().searchBy('id', 'c')).toEqual({ id: 'c', name: 'Cal' });
        });

        it('returns false when nothing matches', () => {
            expect(people().searchBy('id', 'z')).toBe(false);
        });

        it('matches strictly', () => {
            // @ts-expect-error: deliberately the wrong type.
            expect(enumerable([{ id: 1 }]).searchBy('id', '1')).toBe(false);
        });
    });

    describe('searchRegexBy', () => {
        const routes = () => enumerable([
            { hash: /^timer(\/.*)?/, id: 'timer' },
            { hash: '^edit', id: 'edit' },
        ]);

        it('matches against regex and string patterns', () => {
            expect(found(routes().searchRegexBy('hash', 'timer/abc')).id).toBe('timer');
            expect(found(routes().searchRegexBy('hash', 'editworkout')).id).toBe('edit');
        });

        it('returns false when nothing matches', () => {
            expect(routes().searchRegexBy('hash', 'nothing')).toBe(false);
        });
    });

    describe('extractBy', () => {
        it('removes and returns the matching item', () => {
            const list = people();
            expect(list.extractBy('id', 'c')).toEqual({ id: 'c', name: 'Cal' });
            expect(list.map((p) => p.id)).toEqual(['b', 'a']);
        });

        it('returns false and leaves the array alone when nothing matches', () => {
            const list = people();
            expect(list.extractBy('id', 'z')).toBe(false);
            expect(list).toHaveLength(3);
        });
    });

    describe('sortBy', () => {
        it('returns a sorted copy without touching the original', () => {
            const list = people();
            const sorted = list.sortBy('id');

            expect(sorted.map((p) => p.id)).toEqual(['a', 'b', 'c']);
            expect(list.map((p) => p.id)).toEqual(['b', 'c', 'a']);
        });

        it('returns an enumerable', () => {
            expect(found(people().sortBy('name').searchBy('id', 'a')).name).toBe('Ash');
        });
    });
});
