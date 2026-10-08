import { describe, expect, it } from 'vitest';
import { effort } from '../../../js/src/utilities/effort.js';

describe('effort.mode', () => {
    it('finds a mode by id', () => {
        expect(effort.mode('power').label).toBe('Power');
        expect(effort.mode('hrZone').levels).toHaveLength(5);
    });

    it('falls back to the default mode for unknown or missing ids', () => {
        expect(effort.mode('nope').id).toBe(effort.defaultMode);
        expect(effort.mode(undefined).id).toBe(effort.defaultMode);
    });

    it('defaults to perceived effort', () => {
        expect(effort.defaultMode).toBe('perceived');
    });

    it('has unique mode ids', () => {
        const ids = effort.modes.map((m) => m.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe('effort.parse', () => {
    describe('scale modes', () => {
        it('accepts a level on the scale', () => {
            expect(effort.parse('perceived', '7')).toBe(7);
            expect(effort.parse('hrZone', 3)).toBe(3);
        });

        it('rejects values off the scale', () => {
            expect(effort.parse('perceived', '11')).toBeNull();
            expect(effort.parse('hrZone', '0')).toBeNull();
            expect(effort.parse('hrZone', '6')).toBeNull();
        });
    });

    describe('numeric modes', () => {
        it('accepts values within bounds', () => {
            expect(effort.parse('heartRate', '160')).toBe(160);
            expect(effort.parse('power', 250)).toBe(250);
        });

        it('clamps values to the bounds', () => {
            expect(effort.parse('heartRate', '10')).toBe(40);
            expect(effort.parse('heartRate', '300')).toBe(220);
            expect(effort.parse('power', '-5')).toBe(0);
            expect(effort.parse('power', '9999')).toBe(2000);
        });
    });

    it('truncates decimals', () => {
        expect(effort.parse('heartRate', '160.9')).toBe(160);
    });

    it.each(['', 'abc', null, undefined])('returns null for non-numeric input %j', (raw) => {
        expect(effort.parse('heartRate', raw)).toBeNull();
        expect(effort.parse('perceived', raw)).toBeNull();
    });

    it('parses against the default mode when the mode is unknown', () => {
        expect(effort.parse('nope', '10')).toBe(10);
        expect(effort.parse('nope', '11')).toBeNull();
    });
});

describe('effort.describe', () => {
    it('uses the level label for scale modes', () => {
        expect(effort.describe('hrZone', 4)).toBe('Z4 - Threshold (80-90% max)');
    });

    it('adds the unit for numeric modes', () => {
        expect(effort.describe('power', 250)).toBe('250 W');
        expect(effort.describe('heartRate', 0)).toBe('0 bpm');
    });

    it('returns null when there is no target, or it is off the scale', () => {
        expect(effort.describe('power', undefined)).toBeNull();
        expect(effort.describe('power', null)).toBeNull();
        expect(effort.describe('hrZone', 9)).toBeNull();
    });
});

describe('effort.intensity', () => {
    it('measures scale levels against the top of the scale', () => {
        expect(effort.intensity('hrZone', 5, [])).toBe(1);
        expect(effort.intensity('perceived', 3, [])).toBeCloseTo(0.3);
    });

    it('spreads numbers across the workout\'s easiest to hardest', () => {
        const efforts = [115, 160, 165, null];
        expect(effort.intensity('heartRate', 115, efforts)).toBe(0);
        expect(effort.intensity('heartRate', 165, efforts)).toBe(1);
        expect(effort.intensity('heartRate', 160, efforts)).toBeCloseTo(0.9);
    });

    it('treats a workout of one effort as all-out', () => {
        expect(effort.intensity('power', 250, [250, 250])).toBe(1);
    });

    it('is zero for intervals with no effort', () => {
        expect(effort.intensity('power', null, [250])).toBe(0);
        expect(effort.intensity('hrZone', undefined, [])).toBe(0);
    });
});
