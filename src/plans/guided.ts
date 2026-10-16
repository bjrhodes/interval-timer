import { conversions } from '../utilities/conversions.ts';
import { effort, type ModeId } from '../utilities/effort.ts';
import { format } from '../utilities/format.ts';
import type { Curve, Interval, Plan, Preferences, TestId, Workout } from '../types.ts';

interface Template {
    name: string;
    // minutes, when the session has a slot to fit: a hard session shrinks to fit it, an easy one fills it.
    intervals: (level: number, week: number, budget?: number) => Interval[];
}

/**
 * A guided cycling plan: a calibration test, then rolling 4-week blocks of sessions done in order, each block ending
 * in a retest. A plan by feel has nothing to calibrate, so it has no test: each block ends in a rest week instead, and
 * the next block starts a level up.
 *
 * Every session is planned in perceived effort, so the conversion curves the tests set show it in whatever the rider
 * measures with, and a retest that moves a curve moves every later target with it.
 *
 * A rider can give exact availability instead of sessions a week: up to two slots a day, each a number of minutes.
 * Each week then puts its hard sessions on the longest days, never two in a row, fills the other slots with easy
 * spins sized to the week's training load, and keeps a day free for rest even when every day is offered.
 *
 * The plan record is `{mode, test, sessionsPerWeek or slots, level, block, results, completed}`, with no `test` by
 * feel. Sessions aren't stored: each is built from the record and its id, `plan-test` for the first test or
 * `plan-b{block}-w{week}-s{n}` after it.
 */

const WEEKS = 4;
const MAX_LEVEL = 6;
// the talk test stops where talking gets hard, which the default curves put at RPE 6.
const TALK_RPE = 6;
// the shortest slot a hard session fits in, and the test with its warm-up and cool-down.
const HARD_MINUTES = 30;
const TEST_MINUTES = 35;
// the shortest easy spin, and the most hard sessions in a week.
const EASY_MINUTES = 20;
const MAX_HARD = 3;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const minutes = (action: string, time: number, rpe: number): Interval => ({action: action, time: time, unit: 'minutes', effort: rpe});

const repeat = <T>(times: number, fn: (n: number) => T | T[]) => Array.from({length: times}, (_, n) => fn(n + 1)).flat() as T[];

const warmup = minutes('Warm up: easy spin', 10, 3);
const cooldown = minutes('Cool down: easy spin', 5, 2);

// the most reps of work and recovery that fit a budget around the warm-up and cool-down, and never fewer than one.
const fit = (reps: number, work: number, recover: number, budget = Infinity) =>
    Math.max(1, Math.min(reps, Math.floor((budget - warmup.time - cooldown.time + recover) / (work + recover))));

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
        intervals: (level, week, budget = Infinity) => {
            // a short slot shortens the efforts, down to the 6 minutes they start at, before it drops one.
            const reps = fit(level >= 4 ? 3 : 2, 6, 4, budget),
                work = Math.min(20, 6 + 2 * (level - 1) + 2 * (week - 1), Math.floor((budget - warmup.time - cooldown.time - 4 * (reps - 1)) / reps));
            return [warmup].concat(
                repeat(reps, (n) => [minutes('Threshold ' + n + ' of ' + reps + ': hard but steady', work, 7)]
                    .concat(n < reps ? [minutes('Recover', 4, 2)] : [])),
                [cooldown]);
        },
    },
    vo2: {
        name: 'VO2 max',
        intervals: (level, week, budget) => {
            const work = level < 3 ? 2 : 3,
                reps = fit(4 + Math.floor(level / 2) + (week - 1), work, work, budget);
            return [warmup].concat(
                repeat(reps, (n) => [minutes('Effort ' + n + ' of ' + reps + ': very hard', work, 9)]
                    .concat(n < reps ? [minutes('Recover', work, 2)] : [])),
                [cooldown]);
        },
    },
    endurance: {
        name: 'Endurance',
        intervals: (level, week, budget) => [
            minutes('Endurance: steady, you could hold a conversation', budget ?? Math.min(120, 30 + 10 * (level - 1) + 10 * (week - 1)), 4),
        ],
    },
    overUnders: {
        name: 'Over-unders',
        intervals: (level, week, budget = Infinity) => {
            // each pair is 2 minutes under and 1 over.
            const pairs = Math.max(1, Math.min(1 + week, Math.floor((budget - warmup.time - cooldown.time) / 3))),
                sets = fit(2 + Math.floor((level - 1) / 2), pairs * 3, 4, budget);
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
        intervals: (level, week, budget) => [minutes('Easy spin: recover for the test', budget ?? 30, 3)],
    },
    recovery: {
        name: 'Recovery spin',
        intervals: (level, week, budget) => [minutes('Easy spin: rest week, let the training sink in', budget ?? 30, 3)],
    },
    spin: {
        name: 'Easy spin',
        intervals: (level, week, budget) => [minutes('Easy spin: keep it light, this is recovery between hard days', budget ?? 30, 3)],
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

const build = (plan: Plan, id: string, kind: string, week: number, title: string, budget?: number): Workout => {
    // only a plan with a test has test sessions.
    const isTest = kind === 'test',
        template = isTest ? tests[plan.test!] : sessions[kind];
    return {
        id: id,
        title: title + template.name,
        effortMode: 'perceived',
        intervals: template.intervals(plan.level, week, budget),
        plan: true,
        test: isTest,
    };
};

const { timeInSeconds } = format();

// training load (TSS): hours times intensity squared, times 100. Intensity is the target's share of FTP on the default
// power curve, where FTP is about 75% of ramp peak, so an hour at RPE 7 is about 100.
const loadOf = (intervals: Interval[]) => intervals.reduce((total, interval) =>
    total + timeInSeconds(interval.time, interval.unit) / 3600 * (conversions.valueOn(conversions.defaults.power, interval.effort ?? 1) / 75) ** 2 * 100, 0);

// the load a week aims for: it grows through the build weeks and eases off in the last.
const weekLoad = (level: number, week: number) => (150 + 50 * (level - 1)) * (week < WEEKS ? 1 + 0.07 * (week - 1) : 0.6);

const HARD = ['threshold', 'vo2', 'overUnders'];
const SPINS = ['spin', 'easy', 'recovery'];

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

// availability a plan can be built on: 7 days of up to two slots, at least two days, and one slot for a hard session.
const validSlots = (slots?: number[][] | null): slots is number[][] => !!slots && slots.length === 7 &&
    slots.every((day) => day.length <= 2 && day.every((length) => length > 0)) &&
    slots.filter((day) => day.length).length >= 2 &&
    slots.some((day) => day.some((length) => length >= HARD_MINUTES));

// a rider who offers every day still gets one off, the day with least time; -1 when there's a day off already.
const restDay = (slots: number[][]) => {
    const totals = slots.map(sum);
    return totals.every((total) => total > 0) ? totals.lastIndexOf(Math.min(...totals)) : -1;
};

const near = (a: number, b: number) => (a - b + 7) % 7 === 1 || (b - a + 7) % 7 === 1;

// what each day's longest slot holds this week; any other slot on a day is an easy spin.
const kindsOf = (plan: Plan, slots: number[][], week: number) => {
    const rest = restDay(slots),
        days = repeat(7, (n) => n - 1).filter((day) => slots[day].length && day !== rest),
        // a tie goes to the later day, so long rides land on the weekend.
        longest = [...days].sort((a, b) => slots[b][0] - slots[a][0] || b - a),
        kinds: Record<number, string> = {};
    if (week === WEEKS && plan.test) {
        // the test ends the block on a day it fits, with openers the ride before.
        const testDay = days.filter((day) => slots[day][0] >= TEST_MINUTES).pop() ?? longest[0],
            before = days.filter((day) => day < testDay).pop();
        days.forEach((day) => kinds[day] = 'easy');
        if (before !== undefined && slots[before][0] >= HARD_MINUTES) {
            kinds[before] = 'openers';
        }
        kinds[testDay] = 'test';
        return kinds;
    }
    // as with sessions a week, three days or more get a long ride, on the longest day, if another can still go hard.
    const fits = longest.filter((day) => slots[day][0] >= HARD_MINUTES),
        endurance = days.length > 2 && fits.length > 1 ? longest[0] : undefined,
        hard = fits.filter((day) => day !== endurance)
            .reduce((chosen: number[], day) => chosen.length < MAX_HARD && !chosen.some((other) => near(day, other))
                ? chosen.concat([day]) : chosen, [])
            .sort((a, b) => a - b);
    days.forEach((day) => kinds[day] = 'spin');
    hard.forEach((day, i) => kinds[day] = HARD[i]);
    if (endurance !== undefined) {
        kinds[endurance] = 'endurance';
    }
    // a rest week keeps the long ride, and the rest is easy.
    if (week === WEEKS) {
        days.forEach((day) => kinds[day] = kinds[day] === 'endurance' ? 'endurance' : 'recovery');
    }
    return kinds;
};

// a week of sessions fitted to the rider's slots. Hard sessions take their slot. The long ride takes what's left of the
// week's load after a short spin on each easy slot, but never less than its usual length for the level, then the
// spins share out any more by slot length.
const slotted = (plan: Plan, week: number) => {
    const slots = plan.slots!.map((day) => [...day].sort((a, b) => b - a)),
        kinds = kindsOf(plan, slots, week),
        second = week < WEEKS ? 'spin' : plan.test ? 'easy' : 'recovery',
        rides = Object.keys(kinds).map(Number).flatMap((day) => slots[day].map((length, n) => ({day: day, length: length, kind: n ? second : kinds[day]})))
            .sort((a, b) => a.day - b.day),
        load = (kind: string, budget: number) => loadOf(build(plan, '', kind, week, '', budget).intervals),
        shortest = (length: number) => Math.min(length, EASY_MINUTES),
        // the minutes, to the nearest 5, that come to a load, within the slot.
        sized = (ride: typeof rides[number], target: number, least = shortest(ride.length)) =>
            Math.min(ride.length, Math.max(least, 5 * Math.round(target / load(ride.kind, 60) * 60 / 5))),
        long = rides.find((ride) => ride.kind === 'endurance'),
        spins = rides.filter((ride) => SPINS.includes(ride.kind)),
        budgets = new Map(rides.map((ride) => [ride, ride.length])),
        spare = weekLoad(plan.level, week) - sum(rides.filter((ride) => ride !== long && !spins.includes(ride)).map((ride) => load(ride.kind, ride.length)));
    if (long) {
        budgets.set(long, sized(long, spare - sum(spins.map((ride) => load(ride.kind, shortest(ride.length)))),
            // a rest week's is no longer than the block's first.
            sessions.endurance.intervals(plan.level, week < WEEKS ? week : 1)[0].time));
    }
    const left = spare - (long ? load(long.kind, budgets.get(long)!) : 0),
        spinMinutes = sum(spins.map((ride) => ride.length));
    spins.forEach((ride) => budgets.set(ride, sized(ride, left * ride.length / spinMinutes)));
    return rides.map((ride, i) => build(plan, idOf(plan.block, week, i + 1), ride.kind, week,
        'Block ' + plan.block + ', week ' + week + ', ' + DAYS[ride.day].slice(0, 3) + ': ', budgets.get(ride)));
};

// every session in the plan's current block, in order.
const block = (plan: Plan) => {
    if (!plan.block) {
        return [build(plan, 'plan-test', 'test', 0, '')];
    }
    return repeat(WEEKS, (week) => plan.slots ? slotted(plan, week) : (week < WEEKS ? weeks.build : plan.test ? weeks.test : weeks.rest)[plan.sessionsPerWeek!].map((kind, i) =>
        build(plan, idOf(plan.block, week, i + 1), kind, week, 'Block ' + plan.block + ', week ' + week + ': ')));
};

const workout = (plan: Plan, id: string) => block(plan).find((session) => session.id === id) || false;

const next = (plan: Plan, count: number) => block(plan).filter((session) => !plan.completed.includes(session.id)).slice(0, count);

// how often a plan rides: exact slots when they're usable, otherwise sessions a week, 3 unless told.
const availability = (sessionsPerWeek?: number, slots?: number[][] | null) => validSlots(slots)
    ? {slots: slots}
    : {sessionsPerWeek: sessionsPerWeek && weeks.build[sessionsPerWeek] ? sessionsPerWeek : 3};

// a plan by feel skips the test and starts on its first block, so it needs its availability up front.
const create = (mode: string, test: string | null, sessionsPerWeek?: number, slots?: number[][] | null): Plan => effort.mode(mode).id === 'perceived'
    ? {mode: 'perceived', test: null, ...availability(sessionsPerWeek, slots), block: 1, level: 1, results: [], completed: []}
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
    days: DAYS,
    tests: tests,
    loadOf: loadOf,
    validSlots: validSlots,
    restDay: restDay,
    create: create,
    block: block,
    workout: workout,
    next: next,
    complete: complete,
    applyResult: applyResult,
};
