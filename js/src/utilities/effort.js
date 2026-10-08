/**
 * Effort modes a workout can be planned in. A workout stores its mode as `effortMode`,
 * and each interval stores its target within that mode as a number in `effort`.
 *
 * Scale modes offer a fixed set of gradations; numeric modes take a free value within bounds.
 */
const modes = [
    {
        id: 'perceived',
        label: 'Perceived effort',
        type: 'scale',
        levels: [
            {value: 1,  label: '1 - Very easy'},
            {value: 2,  label: '2 - Easy'},
            {value: 3,  label: '3 - Moderate'},
            {value: 4,  label: '4 - Somewhat hard'},
            {value: 5,  label: '5 - Hard'},
            {value: 6,  label: '6 - Harder'},
            {value: 7,  label: '7 - Very hard'},
            {value: 8,  label: '8 - Very, very hard'},
            {value: 9,  label: '9 - Near max'},
            {value: 10, label: '10 - Max effort'},
        ],
    },
    {
        id: 'hrZone',
        label: 'Heart Rate Zone',
        type: 'scale',
        levels: [
            {value: 1, label: 'Z1 - Recovery (50-60% max)'},
            {value: 2, label: 'Z2 - Endurance (60-70% max)'},
            {value: 3, label: 'Z3 - Tempo (70-80% max)'},
            {value: 4, label: 'Z4 - Threshold (80-90% max)'},
            {value: 5, label: 'Z5 - VO2 max (90-100% max)'},
        ],
    },
    {
        id: 'heartRate',
        label: 'Heart Rate',
        type: 'numeric',
        unit: 'bpm',
        min: 40,
        max: 220,
        placeholder: '160',
    },
    {
        id: 'power',
        label: 'Power',
        type: 'numeric',
        unit: 'W',
        min: 0,
        max: 2000,
        placeholder: '250',
    },
];

const defaultMode = modes[0].id;

const mode = (id) => {
    return modes.find((m) => m.id === id) || modes.find((m) => m.id === defaultMode);
};

/**
 * Coerces raw input into a valid effort for the mode, or null when there isn't one.
 */
const parse = (modeId, raw) => {
    const m = mode(modeId);
    const value = parseInt(raw, 10);

    if (isNaN(value)) {
        return null;
    }
    if (m.type === 'scale') {
        return m.levels.some((level) => level.value === value) ? value : null;
    }
    return Math.min(m.max, Math.max(m.min, value));
};

/**
 * A short, human label for an effort target, e.g. "Z4 - Threshold (80-90% max)" or "250 W", or null for no target.
 */
const describe = (modeId, value) => {
    const m = mode(modeId);
    if (value === null || typeof(value) === 'undefined') {
        return null;
    }
    if (m.type === 'scale') {
        const level = m.levels.find((l) => l.value === value);
        return level ? level.label : null;
    }
    return value + ' ' + m.unit;
};

/**
 * How hard an effort is, from 0 to 1, for drawing it. Scales measure against their top level; numbers have no
 * natural top, so they spread across the workout's own easiest to hardest efforts.
 */
const intensity = (modeId, value, efforts) => {
    const m = mode(modeId);
    if (typeof(value) !== 'number') {
        return 0;
    }
    if (m.type === 'scale') {
        return value / m.levels[m.levels.length - 1].value;
    }
    const numbers = efforts.filter((e) => typeof(e) === 'number'),
        lowest = Math.min(...numbers),
        highest = Math.max(...numbers);
    return highest > lowest ? (value - lowest) / (highest - lowest) : 1;
};

export const effort = {
    modes: modes,
    defaultMode: defaultMode,
    mode: mode,
    parse: parse,
    describe: describe,
    intensity: intensity,
};
