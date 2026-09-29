import { format } from '../utilities/format.js';

/**
 * A workout session as a pure state machine: no DOM, no timers. The timer view feeds it events and renders
 * whatever state comes back.
 *
 *   ready    --START-->  running
 *   running  --PAUSE-->  paused
 *   paused   --START-->  running
 *   running  --TICK-->   running (possibly on a later interval) | finished
 *   finished            ignores everything
 *
 * Time is tracked as absolute timestamps (ms, e.g. from performance.now()) rather than counted ticks, so a TICK
 * after a long gap (a backgrounded tab) catches up across as many intervals as have elapsed.
 */
const { timeInSeconds } = format();

const msOf = (interval) => interval.seconds * 1000;

const create = (intervals) => {
    const playable = (intervals || [])
        .filter((interval) => interval && typeof(interval.time) !== 'undefined')
        .map((interval) => ({action: interval.action, seconds: timeInSeconds(interval.time, interval.unit)}))
        .filter((interval) => interval.seconds > 0);

    return {
        status: playable.length ? 'ready' : 'finished',
        intervals: playable,
        index: 0,
        endsAt: null,
        remainingMs: playable.length ? msOf(playable[0]) : 0,
    };
};

// moves past every interval that ended by `now`, carrying over the overshoot so there's no drift.
const catchUp = (state, now) => {
    if (now < state.endsAt) {
        return state;
    }
    const index = state.index + 1;
    if (index >= state.intervals.length) {
        return {...state, status: 'finished', index: index, endsAt: null, remainingMs: 0};
    }
    return catchUp({...state, index: index, endsAt: state.endsAt + msOf(state.intervals[index])}, now);
};

const handlers = {
    ready: {
        START: (state, now) => ({...state, status: 'running', endsAt: now + state.remainingMs}),
    },
    running: {
        PAUSE: (state, now) => {
            const ticked = catchUp(state, now);
            return ticked.status === 'finished'
                ? ticked
                : {...ticked, status: 'paused', endsAt: null, remainingMs: ticked.endsAt - now};
        },
        TICK: catchUp,
    },
    paused: {
        START: (state, now) => ({...state, status: 'running', endsAt: now + state.remainingMs}),
    },
    finished: {},
};

const transition = (state, event) => {
    const handler = handlers[state.status][event.type];
    return handler ? handler(state, event.now) : state;
};

const current = (state) => state.intervals[state.index] || null;

const next = (state) => state.intervals[state.index + 1] || null;

const remainingMs = (state, now) => {
    return state.status === 'running' ? Math.max(0, state.endsAt - now) : state.remainingMs;
};

// whole seconds left on the current interval, rounded up so the clock shows 0:14:00 until a full second has passed.
const secondsLeft = (state, now) => Math.ceil(remainingMs(state, now) / 1000);

const totalSeconds = (state) => state.intervals.reduce((total, interval) => total + interval.seconds, 0);

// fraction of the whole workout completed, from 0 to 1.
const progress = (state, now) => {
    const total = totalSeconds(state) * 1000;
    if (state.status === 'finished' || total === 0) {
        return 1;
    }
    const done = state.intervals
        .slice(0, state.index + 1)
        .reduce((sum, interval) => sum + msOf(interval), 0) - remainingMs(state, now);
    return done / total;
};

export const session = {
    create: create,
    transition: transition,
    current: current,
    next: next,
    secondsLeft: secondsLeft,
    totalSeconds: totalSeconds,
    progress: progress,
};
