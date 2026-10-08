const TICK_MS = 250;

/**
 * Drives a workout session: the session decides what state the workout is in, this view feeds it clicks, key
 * presses, animation frames and timer ticks, then turns each change of state into DOM updates and beeps.
 */
export const timer = (el, state, reportError, factory) => {
    const session = factory.session(),
        beep = factory.beep(),
        effort = factory.effort(),
        format = factory.format(),
        classy = factory.classy(),
        router = factory.router(),
        wakeLock = factory.wakeLock(),
        workoutStore = factory.store('workout'),
        els = {
            title: null,
            remaining: null,
            progress: null,
            progressFill: null,
            graphs: null,
            time: null,
            action: null,
            effort: null,
            nextAction: null,
            nextTime: null,
            status: null
        };
    let details,
        workout,
        frame = null,
        ticker = null,
        shownSeconds = null;

    const loadWorkout = async () => {
        const params = router.parameters();
        return (params.length >= 2 && await workoutStore.getWorkout(params[1])) || null;
    };

    const describeEffort = (interval) => {
        return (interval && effort.describe(details && details.effortMode, interval.effort)) || '';
    };

    const renderIntervals = () => {
        const now = session.current(workout),
            next = session.next(workout);

        if (!now) {
            els.time.textContent = details ? 'Done' : '--';
            els.action.textContent = details ? 'Workout complete' : 'Workout not found';
            els.effort.textContent = '';
            els.nextAction.textContent = '-';
            els.nextTime.textContent = '';
            return;
        }
        els.action.textContent = now.action;
        els.effort.textContent = describeEffort(now);
        els.nextAction.textContent = next ? next.action : 'Finish';
        els.nextTime.textContent = next
            ? [format.durationAsClock(next.seconds), describeEffort(next)].filter((part) => part).join(' · ')
            : '';
    };

    // one bar per interval, as wide as it is long and as tall as it is hard; the fill's copy shows how far through.
    const renderGraph = () => {
        const efforts = workout.intervals.map((interval) => interval.effort);
        els.graphs.forEach((graph) => {
            graph.replaceChildren(...workout.intervals.map((interval) => {
                const bar = window.document.createElement('div');
                bar.className = 'timer__graph-bar';
                bar.style.flexGrow = interval.seconds;
                bar.style.setProperty('--intensity', effort.intensity(details.effortMode, interval.effort, efforts));
                return bar;
            }));
        });
    };

    const renderStatus = () => {
        const paused = workout.status === 'ready' || workout.status === 'paused';
        classy[paused ? 'add' : 'remove'](els.status, 'interval-timer__status--paused');
        els.status.setAttribute('aria-label', paused ? 'Start' : 'Pause');
        el.setAttribute('data-status', workout.status);
    };

    const renderProgress = (now) => {
        const done = session.progress(workout, now);
        els.progressFill.style.clipPath = 'inset(0 ' + (100 - done * 100) + '% 0 0)';
        els.progress.setAttribute('aria-valuenow', Math.round(done * 100));
        els.remaining.textContent = format.durationAsClock(session.remainingSeconds(workout, now)) + ' left';
    };

    const renderClock = (now) => {
        if (workout.status === 'finished') {
            renderProgress(now);
            return false;
        }
        const seconds = session.secondsLeft(workout, now);
        if (seconds !== shownSeconds) {
            els.time.textContent = format.durationAsClock(seconds);
            shownSeconds = seconds;
            renderProgress(now);
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

    const tick = () => {
        dispatch({type: 'TICK', now: window.performance.now()});
    };

    const loop = () => {
        frame = null;
        tick();
    };

    // browsers stop animation frames in hidden tabs, so a slow interval keeps the clock (and its beeps) going there.
    const startLoop = () => {
        frame = frame === null ? window.requestAnimationFrame(loop) : frame;
        ticker = ticker === null ? window.setInterval(tick, TICK_MS) : ticker;
    };

    const stopLoop = () => {
        if (frame !== null) {
            window.cancelAnimationFrame(frame);
            frame = null;
        }
        if (ticker !== null) {
            window.clearInterval(ticker);
            ticker = null;
        }
    };

    const dispatch = (event) => {
        const prev = workout;
        workout = session.transition(workout, event);
        // the state only changes between intervals, but the clock moves on every tick.
        render(prev, event.now);
        if (workout.status === 'running') {
            startLoop();
            wakeLock.acquire();
        } else {
            stopLoop();
            wakeLock.release();
        }
    };

    const toggle = () => {
        beep.unlock();
        dispatch({type: workout.status === 'running' ? 'PAUSE' : 'START', now: window.performance.now()});
    };

    // anywhere on the screen is a play/pause button, except the way out.
    const clicked = (e) => {
        if (e.target.closest('a')) {
            return;
        }
        toggle();
        e.preventDefault();
    };

    // space toggles too, leaving focused controls to handle it themselves.
    const keyed = (e) => {
        if (e.key !== ' ' || e.target.closest('a, button, input, select, textarea')) {
            return;
        }
        toggle();
        e.preventDefault();
    };

    const teardown = () => {
        stopLoop();
        wakeLock.release();
        el.style.display = '';
        el.removeEventListener('click', clicked);
        window.document.removeEventListener('keydown', keyed);
    };

    const setup = async () => {
        details = await loadWorkout();
        const intervals = details ? details.intervals : [];

        if (!intervals || typeof(intervals.forEach) !== 'function') {
            reportError('Timer view could not read intervals.');
        }
        workout = session.create(intervals);
        shownSeconds = null;

        el.style.display = 'flex';

        els.title = el.querySelector('.timer__title');
        els.remaining = el.querySelector('.timer__remaining');
        els.progress = el.querySelector('.timer__progress');
        els.progressFill = el.querySelector('.timer__progress-fill');
        els.graphs = el.querySelectorAll('.timer__graph');
        els.time = el.querySelector('.current-interval__timer');
        els.action = el.querySelector('.current-interval__action');
        els.effort = el.querySelector('.current-interval__effort');
        els.nextAction = el.querySelector('.next-interval__action');
        els.nextTime = el.querySelector('.next-interval__time');
        els.status = el.querySelector('.interval-timer__status');

        els.title.textContent = details ? details.title : '';
        renderIntervals();
        renderGraph();
        renderStatus();
        renderClock(0);
        el.addEventListener('click', clicked);
        window.document.addEventListener('keydown', keyed);
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
