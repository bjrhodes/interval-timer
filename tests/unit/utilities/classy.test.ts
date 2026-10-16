import { describe, expect, it } from 'vitest';
import { Classy } from '../../../src/utilities/classy.ts';

describe('Classy', () => {
    describe('with classList support', () => {
        const classy = Classy(document);
        const element = (className: string) => {
            const el = document.createElement('div');
            el.className = className;
            return el;
        };

        it('adds a class once', () => {
            const el = element('btn');
            classy.add(el, 'active');
            classy.add(el, 'active');
            expect(el.className).toBe('btn active');
        });

        it('removes a class', () => {
            const el = element('btn active');
            classy.remove(el, 'active');
            expect(el.className).toBe('btn');
        });

        it('checks for whole class names', () => {
            const el = element('btn-primary');
            expect(classy.has(el, 'btn-primary')).toBe(true);
            expect(classy.has(el, 'btn')).toBe(false);
        });
    });

    describe('without classList support', () => {
        const classy = Classy({ body: {} } as unknown as Document);
        // a bare object, so only className is there to work with.
        const element = (className: string) => ({ className }) as Element;

        it('adds a class once', () => {
            const el = element('btn');
            classy.add(el, 'active');
            classy.add(el, 'active');
            expect(el.className.split(' ')).toEqual(['btn', 'active']);
        });

        it('removes a class', () => {
            const el = element('btn active');
            classy.remove(el, 'active');
            expect(classy.has(el, 'active')).toBe(false);
            expect(classy.has(el, 'btn')).toBe(true);
        });

        it('checks for whole class names', () => {
            const el = element('btn-primary');
            expect(classy.has(el, 'btn-primary')).toBe(true);
            expect(classy.has(el, 'btn')).toBe(false);
        });

        it('adds a class that is part of an existing class name', () => {
            const el = element('btn-primary');
            classy.add(el, 'btn');
            expect(el.className).toBe('btn-primary btn');
        });

        it('removes only the whole class name', () => {
            const el = element('btn btn-primary');
            classy.remove(el, 'btn');
            expect(el.className).toBe('btn-primary');
        });

        it('adds to an element with no classes', () => {
            const el = element('');
            classy.add(el, 'active');
            expect(el.className).toBe('active');
        });
    });
});
