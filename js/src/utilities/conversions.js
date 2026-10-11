import { effort } from './effort.js';

/**
 * Translates effort targets between modes, through perceived effort (RPE 1-10) as the common scale.
 *
 * Each mapped mode has a curve: its target at each RPE level, from RPE 1 to RPE 10, so the last point is the peak. A
 * user enters a peak and the curve comes from the default percentages below, or edits the curve directly. Values
 * between points interpolate in a straight line, and values beyond the ends clamp to them.
 *
 * Preferences keep a curve per section, e.g. `{heartRate: {points: [...]}, speed: {unit: 'speedMph', points: [...]}}`.
 */

// % of peak at each RPE level. Power peaks at ramp-test max (FTP is about 75% of it); speed is roughly the cube root
// of power, as drag grows with the cube of speed.
const defaults = {
    heartRate: [55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
    power: [30, 40, 48, 55, 62, 68, 75, 83, 92, 100],
    speed: [67, 74, 78, 82, 85, 88, 91, 94, 97, 100],
};

const KMH_PER_MPH = 1.609344;

// the preferences section each mode reads its curve from.
const sections = {
    heartRate: 'heartRate',
    hrZone: 'heartRate',
    power: 'power',
    speedKmh: 'speed',
    speedMph: 'speed',
};

const curveFromPeak = (sectionId, peak) => defaults[sectionId].map((percent) => Math.round(peak * percent / 100));

const pointsOf = (prefs, sectionId) => {
    const section = prefs && prefs[sectionId];
    return section && Array.isArray(section.points) && section.points.length === 10 ? section.points : null;
};

// a numeric mode's curve, in its own unit.
const curve = (modeId, prefs) => {
    const points = pointsOf(prefs, sections[modeId]);
    if (!points || !modeId.startsWith('speed')) {
        return points;
    }
    const unit = prefs.speed.unit === 'speedMph' ? 'speedMph' : 'speedKmh',
        factor = unit === modeId ? 1 : (modeId === 'speedMph' ? 1 / KMH_PER_MPH : KMH_PER_MPH);
    return points.map((point) => point * factor);
};

const isMapped = (modeId, prefs) => modeId === 'perceived' || !!pointsOf(prefs, sections[modeId]);

// RPE for a value on a curve, where the curve's index + 1 is its RPE.
const rpeOn = (points, value) => {
    if (value <= points[0]) {
        return 1;
    }
    const i = points.findIndex((point, index) => index > 0 && value <= point);
    if (i === -1) {
        return 10;
    }
    const low = points[i - 1], high = points[i];
    return i + (high > low ? (value - low) / (high - low) : 1);
};

// a curve's value at a (possibly fractional) RPE.
const valueOn = (points, rpe) => {
    const at = Math.min(9, Math.max(0, rpe - 1)),
        i = Math.floor(at);
    return i === 9 ? points[9] : points[i] + (points[i + 1] - points[i]) * (at - i);
};

// HR zones are bands of max HR, as the zone labels say: zone n runs from (40 + 10n)% to (50 + 10n)%.
const maxHr = (prefs) => pointsOf(prefs, 'heartRate')[9];

const toRpe = (modeId, value, prefs) => {
    if (modeId === 'perceived') {
        return value;
    }
    if (modeId === 'hrZone') {
        return rpeOn(curve('heartRate', prefs), maxHr(prefs) * (45 + 10 * value) / 100);
    }
    return rpeOn(curve(modeId, prefs), value);
};

const fromRpe = (modeId, rpe, prefs) => {
    const m = effort.mode(modeId);
    if (modeId === 'perceived') {
        return Math.min(10, Math.max(1, Math.round(rpe)));
    }
    if (modeId === 'hrZone') {
        const percent = valueOn(curve('heartRate', prefs), rpe) / maxHr(prefs) * 100;
        return Math.min(5, Math.max(1, Math.ceil((percent - 50) / 10)));
    }
    return Math.min(m.max, Math.max(m.min, Math.round(valueOn(curve(modeId, prefs), rpe))));
};

/**
 * The target in `toId` matching `value` in `fromId`, or null when either mode has no curve or there's no value.
 */
const convert = (fromId, toId, value, prefs) => {
    if (typeof(value) !== 'number') {
        return null;
    }
    if (fromId === toId) {
        return value;
    }
    if (!isMapped(fromId, prefs) || !isMapped(toId, prefs)) {
        return null;
    }
    return fromRpe(toId, toRpe(fromId, value, prefs), prefs);
};

/**
 * The modes a workout planned in `fromId` can be shown in: its own first, then every other mapped mode.
 */
const available = (fromId, prefs) => {
    const others = effort.modes
        .map((m) => m.id)
        .filter((id) => id !== fromId && isMapped(fromId, prefs) && isMapped(id, prefs));
    return [fromId].concat(others);
};

export const conversions = {
    defaults: defaults,
    curveFromPeak: curveFromPeak,
    convert: convert,
    available: available,
};
