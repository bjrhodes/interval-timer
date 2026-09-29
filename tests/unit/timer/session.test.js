import { describe, expect, it } from 'vitest';
import { session } from '../../../js/src/timer/session.js';

const workout = () => session.create([
    {action: 'Warmup', time: 1, unit: 'minutes'},
    {action: 'Burst', time: 10, unit: 'seconds'},
    {action: 'Recover', time: 20, unit: 'seconds'},
]);

// replays events against a fresh workout, returning the final state.
const run = (...events) => events.reduce(session.transition, workout());
const start = (now) => ({type: 'START', now: now});
const pause = (now) => ({type: 'PAUSE', now: now});
const tick = (now) => ({type: 'TICK', now: now});

describe('session', () => {
    describe('create', () => {
        it('starts ready on the first interval, with its full duration left', () => {
            const state = workout();
            expect(state.status).toBe('ready');
            expect(session.current(state).action).toBe('Warmup');
            expect(session.next(state).action).toBe('Burst');
            expect(session.secondsLeft(state, 0)).toBe(60);
        });

        it('skips holes, intervals without a time and zero length intervals', () => {
            const state = session.create([
                undefined,
                {action: 'No time'},
                {action: 'Empty', time: 0, unit: 'seconds'},
                {action: 'Real', time: 5, unit: 'seconds'},
            ]);
            expect(state.intervals).toEqual([{action: 'Real', seconds: 5}]);
        });

        it('is finished straight away when there is nothing to play', () => {
            expect(session.create([]).status).toBe('finished');
            expect(session.create(undefined).status).toBe('finished');
            expect(session.current(session.create([]))).toBeNull();
        });
    });

    describe('transition', () => {
        it('ignores ticks until started', () => {
            const state = run(tick(100000));
            expect(state).toEqual(workout());
        });

        it('counts down from the moment it starts', () => {
            const state = run(start(1000), tick(1500));
            expect(state.status).toBe('running');
            expect(session.secondsLeft(state, 1500)).toBe(60);
            expect(session.secondsLeft(state, 2000)).toBe(59);
        });

        it('moves to the next interval when the current one runs out', () => {
            const state = run(start(0), tick(60000));
            expect(session.current(state).action).toBe('Burst');
            expect(session.secondsLeft(state, 60000)).toBe(10);
        });

        it('catches up across several intervals in one tick, keeping the overshoot', () => {
            const state = run(start(0), tick(75000));
            expect(session.current(state).action).toBe('Recover');
            expect(session.secondsLeft(state, 75000)).toBe(15);
        });

        it('finishes once the last interval runs out', () => {
            const state = run(start(0), tick(90000));
            expect(state.status).toBe('finished');
            expect(session.current(state)).toBeNull();
        });

        it('freezes the time left while paused, down to the part second', () => {
            const paused = run(start(0), tick(1500), pause(1500));
            expect(paused.status).toBe('paused');
            expect(session.secondsLeft(paused, 999999)).toBe(59);

            const resumed = [tick(50000), start(50000)].reduce(session.transition, paused);
            expect(session.secondsLeft(resumed, 50400)).toBe(59);
            expect(session.secondsLeft(resumed, 50600)).toBe(58);
        });

        it('finishes rather than pausing when the workout ran out before the pause', () => {
            expect(run(start(0), pause(100000)).status).toBe('finished');
        });

        it('ignores events that make no sense in the current state', () => {
            expect(run(pause(0))).toEqual(workout());
            const running = run(start(0));
            expect(session.transition(running, start(5000))).toBe(running);
        });

        it('ignores everything once finished', () => {
            const finished = run(start(0), tick(90000));
            [start(1), pause(2), tick(3)].forEach((event) => {
                expect(session.transition(finished, event)).toBe(finished);
            });
        });
    });

    describe('totals', () => {
        it('adds up the whole workout', () => {
            expect(session.totalSeconds(workout())).toBe(90);
        });

        it('reports progress through the whole workout', () => {
            expect(session.progress(workout(), 0)).toBe(0);
            expect(session.progress(run(start(0)), 45000)).toBe(0.5);
            expect(session.progress(run(start(0), tick(75000)), 75000)).toBeCloseTo(75 / 90);
            expect(session.progress(run(start(0), tick(90000)), 90000)).toBe(1);
        });
    });
});
