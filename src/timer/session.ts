import { format } from '../utilities/format.ts';
import type { Interval } from '../types.ts';

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

export interface Playable {
    action: string;
    seconds: number;
    effort?: number;
}

export type Status = 'ready' | 'running' | 'paused' | 'finished';

export interface SessionState {
    status: Status;
    intervals: Playable[];
    index: number;
    // only set while running.
    endsAt: number | null;
    remainingMs: number;
}

export interface SessionEvent {
    type: 'START' | 'PAUSE' | 'TICK';
    now: number;
}

type Handler = (state: SessionState, now: number) => SessionState;

const msOf = (interval: Playable) => interval.seconds * 1000;

const create = (intervals?: (Interval | null | undefined)[] | null): SessionState => {
    const playable = (intervals || [])
        .filter((interval): interval is Interval => !!interval && typeof(interval.time) !== 'undefined')
        .map((interval) => ({
            action: interval.action,
            seconds: timeInSeconds(interval.time, interval.unit),
            effort: interval.effort,
        }))
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
const catchUp: Handler = (state, now) => {
    if (now < state.endsAt!) {
        return state;
    }
    const index = state.index + 1;
    if (index >= state.intervals.length) {
        return {...state, status: 'finished', index: index, endsAt: null, remainingMs: 0};
    }
    return catchUp({...state, index: index, endsAt: state.endsAt! + msOf(state.intervals[index])}, now);
};

const handlers: Record<Status, Partial<Record<SessionEvent['type'], Handler>>> = {
    ready: {
        START: (state, now) => ({...state, status: 'running', endsAt: now + state.remainingMs}),
    },
    running: {
        PAUSE: (state, now) => {
            const ticked = catchUp(state, now);
            return ticked.status === 'finished'
                ? ticked
                : {...ticked, status: 'paused', endsAt: null, remainingMs: ticked.endsAt! - now};
        },
        TICK: catchUp,
    },
    paused: {
        START: (state, now) => ({...state, status: 'running', endsAt: now + state.remainingMs}),
    },
    finished: {},
};

const transition = (state: SessionState, event: SessionEvent) => {
    const handler = handlers[state.status][event.type];
    return handler ? handler(state, event.now) : state;
};

const current = (state: SessionState) => state.intervals[state.index] || null;

const next = (state: SessionState) => state.intervals[state.index + 1] || null;

const remainingMs = (state: SessionState, now: number) => {
    return state.status === 'running' ? Math.max(0, state.endsAt! - now) : state.remainingMs;
};

// whole seconds left on the current interval, rounded up so the clock shows 0:14:00 until a full second has passed.
const secondsLeft = (state: SessionState, now: number) => Math.ceil(remainingMs(state, now) / 1000);

const totalSeconds = (state: SessionState) => state.intervals.reduce((total, interval) => total + interval.seconds, 0);

// whole seconds left in the workout: the current interval's clock plus every interval still to come.
const remainingSeconds = (state: SessionState, now: number) => {
    const later = state.intervals.slice(state.index + 1).reduce((total, interval) => total + interval.seconds, 0);
    return state.status === 'finished' ? 0 : secondsLeft(state, now) + later;
};

// fraction of the whole workout completed, from 0 to 1.
const progress = (state: SessionState, now: number) => {
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
    remainingSeconds: remainingSeconds,
    progress: progress,
};
