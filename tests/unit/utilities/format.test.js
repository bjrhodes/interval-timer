import { describe, expect, it } from 'vitest';
import { format as makeFormat } from '../../../js/src/utilities/format.js';

const format = makeFormat(window);

describe('format.timeInSeconds', () => {
    it.each([
        [30, 'seconds', 30],
        [2, 'minutes', 120],
        [1, 'hours', 3600],
    ])('converts %i %s to %i seconds', (time, units, expected) => {
        expect(format.timeInSeconds(time, units)).toBe(expected);
    });

    it('treats unknown units as seconds', () => {
        expect(format.timeInSeconds(45, 'fortnights')).toBe(45);
        expect(format.timeInSeconds(45)).toBe(45);
    });
});

describe('format.durationAsClock', () => {
    it.each([
        [0, '0:00:00'],
        [5, '0:00:05'],
        [60, '0:01:00'],
        [600, '0:10:00'],
        [3725, '1:02:05'],
        [36000, '10:00:00'],
    ])('formats %i seconds as %s', (seconds, expected) => {
        expect(format.durationAsClock(seconds)).toBe(expected);
    });
});

describe('format.durationAsWords', () => {
    it.each([
        [1, '1 second'],
        [45, '45 seconds'],
        [60, '1 minute'],
        [3661, '1 hour, 1 minute, 1 second'],
        [7320, '2 hours, 2 minutes'],
        [3605, '1 hour, 5 seconds'],
    ])('formats %i seconds as "%s"', (seconds, expected) => {
        expect(format.durationAsWords(seconds)).toBe(expected);
    });

    it('returns an empty string for no time at all', () => {
        expect(format.durationAsWords(0)).toBe('');
    });
});
