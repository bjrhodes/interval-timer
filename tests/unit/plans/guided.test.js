import { describe, expect, it } from 'vitest';
import { guided } from '../../../js/src/plans/guided.js';
import { conversions } from '../../../js/src/utilities/conversions.js';

const started = (mode = 'power', test = 'ramp') => guided.create(mode, test);

// a plan past its first test, at the given level and sessions a week.
const running = (overrides = {}) => ({
    ...started(),
    block: 1,
    level: 1,
    sessionsPerWeek: 3,
    results: [{date: '2026-10-01', test: 'ramp', steps: 10, value: 300}],
    ...overrides,
});

const minutesAt = (workout, rpe) => workout.intervals
    .filter((interval) => interval.effort === rpe)
    .reduce((total, interval) => total + interval.time, 0);

describe('guided plans', () => {
    describe('before the first test', () => {
        it('has only the test to do', () => {
            const sessions = guided.next(started(), 4);
            expect(sessions.map((s) => s.id)).toEqual(['plan-test']);
            expect(sessions[0].test).toBe(true);
        });

        it('builds the chosen test in perceived effort, climbing step by step', () => {
            const ramp = guided.workout(started('power', 'ramp'), 'plan-test');
            expect(ramp.effortMode).toBe('perceived');
            const steps = ramp.intervals.filter((i) => i.action.startsWith('Step'));
            expect(steps).toHaveLength(20);
            expect(steps[0].effort).toBe(3);
            expect(steps[19].effort).toBe(10);

            const talk = guided.workout(started('power', 'talk'), 'plan-test');
            expect(talk.intervals.filter((i) => i.action.startsWith('Step'))).toHaveLength(10);
            expect(Math.max(...talk.intervals.map((i) => i.effort))).toBe(7);
        });

        it('falls back to feel, and to the ramp for an unknown test', () => {
            expect(guided.create('nonsense', 'ramp', 2).mode).toBe('perceived');
            expect(guided.create('power', 'nonsense').test).toBe('ramp');
        });
    });

    describe('by feel', () => {
        const byFeel = (perWeek = 3) => guided.create('perceived', 'ramp', perWeek);

        it('skips the test and starts on the first block', () => {
            expect(byFeel()).toMatchObject({test: null, block: 1, level: 1, sessionsPerWeek: 3});
            expect(guided.next(byFeel(), 1)[0].title).toBe('Block 1, week 1: Threshold');
            expect(byFeel(9).sessionsPerWeek).toBe(3);
        });

        it.each([2, 3, 4])('ends each block of %i sessions a week in a rest week, with no test', (perWeek) => {
            const sessions = guided.block(byFeel(perWeek));
            expect(sessions).toHaveLength(4 * perWeek);
            expect(sessions.filter((s) => s.test)).toHaveLength(0);
            expect(sessions.slice(-perWeek).every((s) => Math.max(...s.intervals.map((i) => i.effort)) <= 4)).toBe(true);
        });

        it('moves on to the next block a level up once the last session is done', () => {
            const plan = byFeel(2),
                ids = guided.block(plan).map((s) => s.id);
            const almost = ids.slice(0, -1).reduce(guided.complete, plan);
            expect(almost).toMatchObject({block: 1, level: 1});
            expect(guided.complete(almost, ids[ids.length - 1])).toMatchObject({block: 2, level: 2, completed: []});
            expect(guided.complete({...almost, level: 6}, ids[ids.length - 1]).level).toBe(6);
        });
    });

    describe('a block', () => {
        it.each([2, 3, 4])('has 4 weeks of %i sessions, ending in a retest', (perWeek) => {
            const sessions = guided.block(running({sessionsPerWeek: perWeek}));
            expect(sessions).toHaveLength(4 * perWeek);
            expect(sessions.filter((s) => s.test).map((s) => s.id)).toEqual(['plan-b1-w4-s' + perWeek]);
        });

        it('works a little longer each build week', () => {
            const plan = running();
            const work = [1, 2, 3].map((week) => minutesAt(guided.workout(plan, 'plan-b1-w' + week + '-s1'), 7));
            expect(work).toEqual([12, 16, 20]);
        });

        it('works longer at a higher level', () => {
            const at = (level) => minutesAt(guided.workout(running({level}), 'plan-b1-w1-s1'), 7);
            expect(at(3)).toBeGreaterThan(at(1));
        });

        it('waits for the retest to move on, when there is one', () => {
            const plan = running({sessionsPerWeek: 2}),
                ids = guided.block(plan).map((s) => s.id);
            expect(ids.reduce(guided.complete, plan)).toMatchObject({block: 1, completed: ids});
        });

        it('skips sessions already done', () => {
            const plan = running({completed: ['plan-b1-w1-s1']});
            expect(guided.next(plan, 2).map((s) => s.id)).toEqual(['plan-b1-w1-s2', 'plan-b1-w1-s3']);
        });

        it('has no session for an unknown id', () => {
            expect(guided.workout(running(), 'plan-b1-w9-s1')).toBe(false);
            expect(guided.workout(running(), 'threshold-ladder')).toBe(false);
        });
    });

    describe('a test result', () => {
        it('sets the level from how far the first test got', () => {
            const level = (steps) => guided.applyResult(started(), {}, {steps, value: 300}).plan.level;
            expect([level(5), level(10), level(15)]).toEqual([1, 2, 3]);
        });

        it('starts the plan, sets the curve from the ramp peak, and shows targets in the rider\'s mode', () => {
            const {plan, prefs} = guided.applyResult(started(), {}, {steps: 15, value: 300}, '2026-10-14');
            expect(plan).toMatchObject({block: 1, completed: [], results: [{date: '2026-10-14', steps: 15, value: 300}]});
            expect(prefs.power.points).toEqual(conversions.curveFromPeak('power', 300));
            expect(prefs.timerMode).toBe('power');
        });

        it('estimates the peak from where talking got hard', () => {
            const {prefs} = guided.applyResult(started('heartRate', 'talk'), {}, {steps: 6, value: 150});
            // the default heart rate curve has RPE 6 at 80% of max.
            expect(prefs.heartRate.points[9]).toBe(188);
        });

        it('keeps the shape of a curve the rider has edited', () => {
            const edited = [100, 120, 140, 160, 180, 200, 220, 240, 260, 400];
            const {prefs} = guided.applyResult(started(), {power: {points: edited, advanced: true}}, {steps: 15, value: 440});
            expect(prefs.power.points).toEqual(edited.map((p) => Math.round(p * 1.1)));
            expect(prefs.power.advanced).toBe(true);
        });

        it('moves a speed curve into the rider\'s unit', () => {
            const prefs = {speed: {unit: 'speedKmh', points: conversions.curveFromPeak('speed', 50)}};
            const result = guided.applyResult(started('speedMph'), prefs, {steps: 15, value: 33}).prefs;
            expect(result.speed.unit).toBe('speedMph');
            expect(result.speed.points[9]).toBe(33);
        });

        it('leaves curves alone for a feel plan that took a test, and shows targets in it', () => {
            const {prefs} = guided.applyResult({...started(), mode: 'perceived'}, {power: {points: [1]}}, {steps: 12, value: null});
            expect(prefs).toEqual({power: {points: [1]}, timerMode: 'perceived'});
        });

        it('levels up on a retest that holds or improves, and moves on to the next block', () => {
            const plan = running({level: 2, completed: ['plan-b1-w1-s1']});
            const held = guided.applyResult(plan, {}, {steps: 10, value: 300}).plan;
            expect(held).toMatchObject({level: 3, block: 2, completed: []});
            expect(held.results).toHaveLength(2);
            expect(guided.applyResult(plan, {}, {steps: 9, value: 290}).plan.level).toBe(2);
            expect(guided.applyResult(running({level: 6}), {}, {steps: 20, value: 400}).plan.level).toBe(6);
        });

        it('leaves the plan it was given untouched', () => {
            const plan = running();
            guided.applyResult(plan, {}, {steps: 12, value: 310});
            expect(plan.results).toHaveLength(1);
        });
    });
});
