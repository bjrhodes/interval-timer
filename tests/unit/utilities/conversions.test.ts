import { describe, expect, it } from 'vitest';
import { conversions } from '../../../src/utilities/conversions.ts';
import type { Preferences, SectionId } from '../../../src/types.ts';

const { convert, available, curveFromPeak } = conversions;

// max HR 190, ramp test max 400 W, top speed 40 km/h.
const prefs: Preferences = {
    heartRate: { points: curveFromPeak('heartRate', 190) },
    power: { points: curveFromPeak('power', 400) },
    speed: { unit: 'speedKmh', points: curveFromPeak('speed', 40) },
};

describe('conversions.curveFromPeak', () => {
    it('spreads the default percentages of a peak over RPE 1 to 10', () => {
        expect(curveFromPeak('power', 400)).toEqual([120, 160, 192, 220, 248, 272, 300, 332, 368, 400]);
        expect(curveFromPeak('heartRate', 190)).toEqual([105, 114, 124, 133, 143, 152, 162, 171, 181, 190]);
    });

    it('ends at the peak', () => {
        (Object.keys(conversions.defaults) as SectionId[]).forEach((id) => expect(curveFromPeak(id, 50)[9]).toBe(50));
    });
});

describe('conversions.convert', () => {
    it('reads perceived effort straight off a curve', () => {
        expect(convert('perceived', 'power', 7, prefs)).toBe(300);
        expect(convert('power', 'perceived', 300, prefs)).toBe(7);
    });

    it('goes between two curves through perceived effort', () => {
        expect(convert('heartRate', 'power', 162, prefs)).toBe(300);
        expect(convert('power', 'heartRate', 300, prefs)).toBe(162);
    });

    it('interpolates between points', () => {
        // halfway from RPE 7 to 8 on each curve.
        expect(convert('heartRate', 'power', 166.5, prefs)).toBe(316);
    });

    it('clamps beyond either end of a curve', () => {
        expect(convert('power', 'heartRate', 500, prefs)).toBe(190);
        expect(convert('power', 'heartRate', 50, prefs)).toBe(105);
    });

    it('maps heart rate zones through max heart rate', () => {
        expect(convert('heartRate', 'hrZone', 165, prefs)).toBe(4);
        expect(convert('heartRate', 'hrZone', 100, prefs)).toBe(1);
        expect(convert('heartRate', 'hrZone', 200, prefs)).toBe(5);
        expect(convert('perceived', 'hrZone', 7, prefs)).toBe(4);
        // Z4 is 80-90% of max, so its midpoint, 161.5 bpm, is just under RPE 7.
        expect(convert('hrZone', 'power', 4, prefs)).toBe(299);
    });

    it('snaps to the nearest level on a scale', () => {
        expect(convert('power', 'perceived', 290, prefs)).toBe(7);
        expect(convert('power', 'perceived', 9999, prefs)).toBe(10);
    });

    it('converts speed units exactly, from either unit', () => {
        expect(convert('speedKmh', 'speedMph', 36, prefs)).toBe(22);
        const mph: Preferences = { speed: { unit: 'speedMph', points: curveFromPeak('speed', 25) } };
        expect(convert('speedMph', 'speedKmh', 25, mph)).toBe(40);
    });

    it('honours a curve edited by hand', () => {
        const custom = { power: { advanced: true, points: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] } };
        expect(convert('perceived', 'power', 5, custom)).toBe(500);
    });

    it('keeps a value in its own mode, with or without curves', () => {
        expect(convert('power', 'power', 250, {})).toBe(250);
    });

    it('has nothing to give without both curves, or without a value', () => {
        expect(convert('perceived', 'power', 7, {})).toBeNull();
        expect(convert('power', 'speedKmh', 300, { power: prefs.power })).toBeNull();
        expect(convert('perceived', 'power', 7, { power: { points: [1, 2] } })).toBeNull();
        expect(convert('perceived', 'power', undefined, prefs)).toBeNull();
    });
});

describe('conversions.available', () => {
    it('offers only the workout\'s own mode without curves', () => {
        expect(available('power', {})).toEqual(['power']);
        expect(available('perceived', {})).toEqual(['perceived']);
    });

    it('lists the own mode first, then every mapped mode in order', () => {
        const some = { heartRate: prefs.heartRate, power: prefs.power };
        expect(available('heartRate', some)).toEqual(['heartRate', 'perceived', 'hrZone', 'power']);
        expect(available('perceived', { power: prefs.power })).toEqual(['perceived', 'power']);
    });

    it('offers nothing else for a mode with no curve of its own', () => {
        expect(available('speedKmh', { power: prefs.power })).toEqual(['speedKmh']);
    });
});
