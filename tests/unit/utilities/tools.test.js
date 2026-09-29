import { describe, expect, it } from 'vitest';
import { tools } from '../../../js/src/utilities/tools.js';

describe('tools.clone', () => {
    it('makes a deep copy', () => {
        const original = { title: 'a', intervals: [{ time: 1 }] };
        const copy = tools.clone(original);

        expect(copy).toEqual(original);
        copy.intervals[0].time = 99;
        expect(original.intervals[0].time).toBe(1);
    });

    it('passes primitives through', () => {
        expect(tools.clone(false)).toBe(false);
        expect(tools.clone(42)).toBe(42);
        expect(tools.clone('str')).toBe('str');
    });
});

describe('tools.escapeHtml', () => {
    it('escapes html special characters', () => {
        expect(tools.escapeHtml('<a href="/x">Tom & Jerry\'s</a>'))
            .toBe('&lt;a href=&quot;&#x2F;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;&#x2F;a&gt;');
    });

    it('leaves plain text alone', () => {
        expect(tools.escapeHtml('Steady State 90 rpm')).toBe('Steady State 90 rpm');
    });

    it('stringifies non-strings', () => {
        expect(tools.escapeHtml(30)).toBe('30');
        expect(tools.escapeHtml(undefined)).toBe('undefined');
    });
});
