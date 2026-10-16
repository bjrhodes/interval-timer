import { conversions } from '../utilities/conversions.ts';
import { effort, type ModeId } from '../utilities/effort.ts';
import type { Curve, Interval, Plan, Preferences, TestId, Workout } from '../types.ts';

interface Template {
    name: string;
    intervals: (level: number, week: number) => Interval[];
}

/**
 * A guided cycling plan: a calibration test, then rolling 4-week blocks of sessions done in order, each block ending
 * in a retest. A plan by feel has nothing to calibrate, so it has no test: each block ends in a rest week instead, and
 * the next block starts a level up.
 *
 * Every session is planned in perceived effort, so the conversion curves the tests set show it in whatever the rider
 * measures with, and a retest that moves a curve moves every later target with it.
 *
 * The plan record is `{mode, test, sessionsPerWeek, level, block, results, completed}`, with no `test` by feel. Sessions aren't stored: each
 * is built from the record and its id, `plan-test` for the first test or `plan-b{block}-w{week}-s{n}` after it.
 */

const WEEKS = 4;
const MAX_LEVEL = 6;
// the talk test stops where talking gets hard, which the default curves put at RPE 6.
const TALK_RPE = 6;

const minutes = (action: string, time: number, rpe: number): Interval => ({action: action, time: time, unit: 'minutes', effort: rpe});

const repeat = <T>(times: number, fn: (n: number) => T | T[]) => Array.from({length: times}, (_, n) => fn(n + 1)).flat() as T[];

const warmup = minutes('Warm up: easy spin', 10, 3);
const cooldown = minutes('Cool down: easy spin', 5, 2);

const stepsOf = (count: number, from: number, to: number) => repeat(count, (n) => Math.round(from + (to - from) * (n - 1) / (count - 1)));

const tests: Record<TestId, Template & {steps: number}> = {
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
const sessions: Record<string, Template> = {
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
    recovery: {
        name: 'Recovery spin',
        intervals: () => [minutes('Easy spin: rest week, let the training sink in', 30, 3)],
    },
    openers: {
        name: 'Openers',
        intervals: () => [warmup].concat(
            repeat(3, (n) => [minutes('Opener ' + n + ' of 3: quick and hard', 1, 8), minutes('Easy', 3, 3)]),
            [cooldown]),
    },
};

// the order of a week's sessions, by how many there are; the last week eases off into the retest, or rests without one.
const weeks: Record<'build' | 'test' | 'rest', Record<number, string[]>> = {
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
    rest: {
        2: ['recovery', 'endurance'],
        3: ['recovery', 'endurance', 'recovery'],
        4: ['recovery', 'endurance', 'recovery', 'endurance'],
    },
};

const idOf = (block: number, week: number, n: number) => 'plan-b' + block + '-w' + week + '-s' + n;

const build = (plan: Plan, id: string, kind: string, week: number, title: string): Workout => {
    // only a plan with a test has test sessions.
    const isTest = kind === 'test',
        template = isTest ? tests[plan.test!] : sessions[kind];
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
const block = (plan: Plan) => {
    if (!plan.block) {
        return [build(plan, 'plan-test', 'test', 0, '')];
    }
    return repeat(WEEKS, (week) => (week < WEEKS ? weeks.build : plan.test ? weeks.test : weeks.rest)[plan.sessionsPerWeek!].map((kind, i) =>
        build(plan, idOf(plan.block, week, i + 1), kind, week, 'Block ' + plan.block + ', week ' + week + ': ')));
};

const workout = (plan: Plan, id: string) => block(plan).find((session) => session.id === id) || false;

const next = (plan: Plan, count: number) => block(plan).filter((session) => !plan.completed.includes(session.id)).slice(0, count);

// a plan by feel skips the test and starts on its first block, so it needs the sessions a week up front.
const create = (mode: string, test: string | null, sessionsPerWeek?: number): Plan => effort.mode(mode).id === 'perceived'
    ? {mode: 'perceived', test: null, sessionsPerWeek: sessionsPerWeek && weeks.build[sessionsPerWeek] ? sessionsPerWeek : 3,
        block: 1, level: 1, results: [], completed: []}
    : {mode: effort.mode(mode).id, test: tests[test as TestId] ? test as TestId : 'ramp', block: 0, level: 1, results: [], completed: []};

// marks a session done; without a test to move it on, a block's last session starts the next block a level up.
const complete = (plan: Plan, id: string): Plan => {
    const done = plan.completed.includes(id) ? plan : {...plan, completed: plan.completed.concat([id])};
    return !plan.test && !next(done, 1).length
        ? {...done, block: plan.block + 1, level: Math.min(MAX_LEVEL, plan.level + 1), completed: []}
        : done;
};

// the peak a result stands for: a ramp reaches it, a talk test stops short of it by a known share.
const peakOf = (plan: Plan, value: number | null) => {
    const section = conversions.sections[plan.mode];
    if (!section || value === null || !(value > 0)) {
        return null;
    }
    return plan.test === 'ramp' ? value : value * 100 / conversions.defaults[section][TALK_RPE - 1];
};

// sets the curve from a new peak; a curve the rider already has keeps its shape, scaled to the new peak.
const calibrate = (prefs: Preferences, mode: ModeId, peak: number | null) => {
    const next: Preferences = {...structuredClone(prefs), timerMode: mode},
        id = conversions.sections[mode];
    if (!id || peak === null) {
        return next;
    }
    const s = next[id] = next[id] || {},
        // a numeric mode, so a finite peak always parses.
        top = effort.parse(mode, Math.round(peak))!;
    if (id === 'speed' && s.points && (s.unit || 'speedKmh') !== mode) {
        // speed has a curve here, so it always converts.
        s.points = s.points.map((point) => conversions.convert(s.unit || 'speedKmh', mode, point, prefs)!);
    }
    if (id === 'speed') {
        s.unit = mode as Curve['unit'];
    }
    s.points = s.points ? s.points.map((point) => Math.round(point * top / s.points![9])) : conversions.curveFromPeak(id, top);
    return next;
};

/**
 * Records a test result, `{steps, value}`, and starts the next block. The first test sets the level from how far
 * the rider got; each retest that holds or beats the last one moves it up.
 */
const applyResult = (plan: Plan, prefs: Preferences, result: {steps: number, value: number | null}, date: string) => {
    // only a plan with a test has results.
    const test = plan.test!,
        last = plan.results[plan.results.length - 1],
        level = last
            ? Math.min(MAX_LEVEL, plan.level + (result.steps >= last.steps ? 1 : 0))
            : 1 + (result.steps / tests[test].steps >= 0.45 ? 1 : 0) + (result.steps / tests[test].steps >= 0.7 ? 1 : 0),
        value = result.value !== null && result.value > 0 ? result.value : null;
    return {
        plan: {
            ...plan,
            level: level,
            block: plan.block + 1,
            results: plan.results.concat([{date: date, test: test, steps: result.steps, value: value}]),
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
    complete: complete,
    applyResult: applyResult,
};
