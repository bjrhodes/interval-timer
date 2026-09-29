/**
 * Drives a workout session: the session decides what state the workout is in, this view feeds it clicks and
 * animation frames, then turns each change of state into DOM updates and beeps.
 */
export const timer = (el, state, reportError, factory) => {
    const session = factory.session(),
        beep = factory.beep(),
        format = factory.format(),
        classy = factory.classy(),
        router = factory.router(),
        workoutStore = factory.store('workout'),
        els = {
            time: null,
            action: null,
            nextAction: null,
            nextTime: null,
            status: null
        };
    let workout,
        frame = null,
        shownSeconds = null;

    const getIntervals = () => {
        const params = router.parameters();

        if (params.length < 2) {
            return [];
        }
        const found = workoutStore.getWorkout(params[1]);
        return found.intervals || [];
    };

    const renderIntervals = () => {
        const now = session.current(workout),
            next = session.next(workout);

        if (!now) {
            els.time.innerHTML = 'FIN';
            els.action.innerHTML = '-';
            els.nextAction.innerHTML = '-';
            els.nextTime.innerHTML = '-';
            return;
        }
        els.action.innerHTML = now.action;
        els.nextAction.innerHTML = next ? next.action : 'Completed';
        els.nextTime.innerHTML = next ? '(' + format.durationAsClock(next.seconds) + ')' : '-';
    };

    const renderStatus = () => {
        const paused = workout.status === 'ready' || workout.status === 'paused';
        classy[paused ? 'add' : 'remove'](els.status, 'interval-timer__status--paused');
    };

    const renderClock = (now) => {
        if (workout.status === 'finished') {
            return false;
        }
        const seconds = session.secondsLeft(workout, now);
        if (seconds !== shownSeconds) {
            els.time.innerHTML = format.durationAsClock(seconds);
            shownSeconds = seconds;
            return true;
        }
        return false;
    };

    const render = (prev, now) => {
        const intervalChanged = prev.index !== workout.index;
        if (intervalChanged) {
            renderIntervals();
            beep();
            window.setTimeout(beep, 200);
        }
        if (prev.status !== workout.status) {
            renderStatus();
        }
        if (renderClock(now) && !intervalChanged && shownSeconds <= 5) {
            beep();
        }
    };

    const loop = () => {
        frame = null;
        dispatch({type: 'TICK', now: window.performance.now()});
    };

    const stopLoop = () => {
        if (frame !== null) {
            window.cancelAnimationFrame(frame);
            frame = null;
        }
    };

    const dispatch = (event) => {
        const prev = workout;
        workout = session.transition(workout, event);
        // the state only changes between intervals, but the clock moves on every tick.
        render(prev, event.now);
        if (workout.status === 'running') {
            frame = frame === null ? window.requestAnimationFrame(loop) : frame;
        } else {
            stopLoop();
        }
    };

    const playPause = (e) => {
        dispatch({type: workout.status === 'running' ? 'PAUSE' : 'START', now: window.performance.now()});
        e.preventDefault();
    };

    const teardown = () => {
        stopLoop();
        el.style.display = '';
        el.removeEventListener('click', playPause);
    };

    const setup = () => {
        const intervals = getIntervals();

        if (!intervals || typeof(intervals.forEach) !== 'function') {
            reportError('Timer view could not read intervals.');
        }
        workout = session.create(intervals);
        shownSeconds = null;

        el.style.display = 'block';

        els.time = el.querySelector('.current-interval__timer');
        els.action = el.querySelector('.current-interval__action');
        els.nextAction = el.querySelector('.next-interval__action');
        els.nextTime = el.querySelector('.next-interval__time');
        els.status = el.querySelector('.interval-timer__status');

        renderIntervals();
        renderStatus();
        renderClock(0);
        el.addEventListener('click', playPause);
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
