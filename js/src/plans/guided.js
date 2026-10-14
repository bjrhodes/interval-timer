import { conversions } from '../utilities/conversions.js';
import { effort } from '../utilities/effort.js';

/**
 * A guided cycling plan: a calibration test, then rolling 4-week blocks of sessions done in order, each block ending
 * in a retest.
 *
 * Every session is planned in perceived effort, so the conversion curves the tests set show it in whatever the rider
 * measures with, and a retest that moves a curve moves every later target with it.
 *
 * The plan record is `{mode, test, sessionsPerWeek, level, block, results, completed}`. Sessions aren't stored: each
 * is built from the record and its id, `plan-test` for the first test or `plan-b{block}-w{week}-s{n}` after it.
 */

const WEEKS = 4;
const MAX_LEVEL = 6;
// the talk test stops where talking gets hard, which the default curves put at RPE 6.
const TALK_RPE = 6;

const minutes = (action, time, rpe) => ({action: action, time: time, unit: 'minutes', effort: rpe});

const repeat = (times, fn) => Array.from({length: times}, (_, n) => fn(n + 1)).flat();

const warmup = minutes('Warm up: easy spin', 10, 3);
const cooldown = minutes('Cool down: easy spin', 5, 2);

const stepsOf = (count, from, to) => repeat(count, (n) => Math.round(from + (to - from) * (n - 1) / (count - 1)));

const tests = {
    ramp: {
        name: 'Ramp test',
        steps: 20,
        intervals: () => [warmup].concat(
            stepsOf(20, 3, 10).map((rpe, i) => minutes('Step ' + (i + 1) + ': a little harder. Stop when you can\'t keep it up', 1, rpe)),
            [cooldown]),
    },
    talk: {
        name: 'Talk test',
        steps: 10,
        intervals: () => [warmup].concat(
            stepsOf(10, 2, 7).map((rpe, i) => minutes('Step ' + (i + 1) + ': say a full sentence out loud. Still comfortable?', 2, rpe)),
            [cooldown]),
    },
};

// each takes the plan's level (1 up) and the week of the block (1-3), and grows the time spent working.
const sessions = {
    threshold: {
        name: 'Threshold',
        intervals: (level, week) => {
            const reps = level >= 4 ? 3 : 2,
                work = Math.min(20, 6 + 2 * (level - 1) + 2 * (week - 1));
            return [warmup].concat(
                repeat(reps, (n) => [minutes('Threshold ' + n + ' of ' + reps + ': hard but steady', work, 7)]
                    .concat(n < reps ? [minutes('Recover', 4, 2)] : [])),
                [cooldown]);
        },
    },
    vo2: {
        name: 'VO2 max',
        intervals: (level, week) => {
            const reps = 4 + Math.floor(level / 2) + (week - 1),
                work = level < 3 ? 2 : 3;
            return [warmup].concat(
                repeat(reps, (n) => [minutes('Effort ' + n + ' of ' + reps + ': very hard', work, 9)]
                    .concat(n < reps ? [minutes('Recover', work, 2)] : [])),
                [cooldown]);
        },
    },
    endurance: {
        name: 'Endurance',
        intervals: (level, week) => [
            minutes('Endurance: steady, you could hold a conversation', Math.min(120, 30 + 10 * (level - 1) + 10 * (week - 1)), 4),
        ],
    },
    overUnders: {
        name: 'Over-unders',
        intervals: (level, week) => {
            const sets = 2 + Math.floor((level - 1) / 2),
                pairs = 1 + week;
            return [warmup].concat(
                repeat(sets, (set) => repeat(pairs, () => [
                    minutes('Under (set ' + set + ' of ' + sets + '): comfortably hard', 2, 6),
                    minutes('Over (set ' + set + ' of ' + sets + '): push on', 1, 8),
                ]).concat(set < sets ? [minutes('Recover', 4, 2)] : [])),
                [cooldown]);
        },
    },
    easy: {
        name: 'Easy spin',
        intervals: () => [minutes('Easy spin: recover for the test', 30, 3)],
    },
    openers: {
        name: 'Openers',
        intervals: () => [warmup].concat(
            repeat(3, (n) => [minutes('Opener ' + n + ' of 3: quick and hard', 1, 8), minutes('Easy', 3, 3)]),
            [cooldown]),
    },
};

// the order of a week's sessions, by how many there are; the last week eases off into the retest.
const weeks = {
    build: {
        2: ['threshold', 'vo2'],
        3: ['threshold', 'endurance', 'vo2'],
        4: ['threshold', 'endurance', 'vo2', 'overUnders'],
    },
    test: {
        2: ['openers', 'test'],
        3: ['easy', 'openers', 'test'],
        4: ['easy', 'openers', 'easy', 'test'],
    },
};

const idOf = (block, week, n) => 'plan-b' + block + '-w' + week + '-s' + n;

const build = (plan, id, kind, week, title) => {
    const isTest = kind === 'test',
        template = isTest ? tests[plan.test] : sessions[kind];
    return {
        id: id,
        title: title + template.name,
        effortMode: 'perceived',
        intervals: template.intervals(plan.level, week),
        plan: true,
        test: isTest,
    };
};

// every session in the plan's current block, in order.
const block = (plan) => {
    if (!plan.block) {
        return [build(plan, 'plan-test', 'test', 0, '')];
    }
    return repeat(WEEKS, (week) => (week < WEEKS ? weeks.build : weeks.test)[plan.sessionsPerWeek].map((kind, i) =>
        build(plan, idOf(plan.block, week, i + 1), kind, week, 'Block ' + plan.block + ', week ' + week + ': ')));
};

const workout = (plan, id) => block(plan).find((session) => session.id === id) || false;

const next = (plan, count) => block(plan).filter((session) => !plan.completed.includes(session.id)).slice(0, count);

const create = (mode, test) => ({mode: effort.mode(mode).id, test: tests[test] ? test : 'ramp', block: 0, level: 1, results: [], completed: []});

// the peak a result stands for: a ramp reaches it, a talk test stops short of it by a known share.
const peakOf = (plan, value) => {
    const section = conversions.sections[plan.mode];
    if (!section || !(value > 0)) {
        return null;
    }
    return plan.test === 'ramp' ? value : value * 100 / conversions.defaults[section][TALK_RPE - 1];
};

// sets the curve from a new peak; a curve the rider already has keeps its shape, scaled to the new peak.
const calibrate = (prefs, mode, peak) => {
    const next = {...structuredClone(prefs), timerMode: mode},
        id = conversions.sections[mode];
    if (!id || peak === null) {
        return next;
    }
    const s = next[id] = next[id] || {},
        top = effort.parse(mode, Math.round(peak));
    if (id === 'speed' && s.points && (s.unit || 'speedKmh') !== mode) {
        s.points = s.points.map((point) => conversions.convert(s.unit || 'speedKmh', mode, point, prefs));
    }
    if (id === 'speed') {
        s.unit = mode;
    }
    s.points = s.points ? s.points.map((point) => Math.round(point * top / s.points[9])) : conversions.curveFromPeak(id, top);
    return next;
};

/**
 * Records a test result, `{steps, value}`, and starts the next block. The first test sets the level from how far
 * the rider got; each retest that holds or beats the last one moves it up.
 */
const applyResult = (plan, prefs, result, date) => {
    const last = plan.results[plan.results.length - 1],
        level = last
            ? Math.min(MAX_LEVEL, plan.level + (result.steps >= last.steps ? 1 : 0))
            : 1 + (result.steps / tests[plan.test].steps >= 0.45 ? 1 : 0) + (result.steps / tests[plan.test].steps >= 0.7 ? 1 : 0),
        value = result.value > 0 ? result.value : null;
    return {
        plan: {
            ...plan,
            level: level,
            block: plan.block + 1,
            results: plan.results.concat([{date: date, test: plan.test, steps: result.steps, value: value}]),
            completed: [],
        },
        prefs: calibrate(prefs, plan.mode, peakOf(plan, value)),
    };
};

export const guided = {
    tests: tests,
    create: create,
    block: block,
    workout: workout,
    next: next,
    applyResult: applyResult,
};
