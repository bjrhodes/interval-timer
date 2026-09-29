/**
 * @todo this class has got a bit big. I'd like to make this the view controller,
 * simply despatching to sub modules.
 *
 */
export const timer = (el, state, reportError, factory) => {
    const countdown = factory.countdown(),
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
    let intervals = [],
        timerRunning = false;

    const setupInterval = (now, next) => {
        if (!now || typeof(now.time) === 'undefined') {
            return;
        }
        els.time.innerHTML = format.durationAsClock(format.timeInSeconds(now.time, now.unit));
        els.action.innerHTML = now.action;

        if (next.action && next.time && next.unit) {
            els.nextAction.innerHTML = next.action;
            els.nextTime.innerHTML = '(' + format.durationAsClock(format.timeInSeconds(next.time, next.unit)) + ')';
        } else {
            els.nextAction.innerHTML = "Completed";
            els.nextTime.innerHTML = '-';
        }
    };

    const findInterval = () => {
        if (intervals.length === 0) {
            els.nextAction.innerHTML = "-";
            els.action.innerHTML = '-';
            els.time.innerHTML = 'FIN';
        }
        const now = intervals.shift();
        const next = intervals.length ? intervals[0] : false;
        return {now: now, next: next};
    };

    const nextInterval = () => {
        const nextUp = findInterval();
        setupInterval(nextUp.now, nextUp.next);
        initTimer(nextUp.now);
        countdown.start();
    };

    const initTimer = (interval) => {
        if (!interval || typeof(interval.time) === 'undefined') {
            return;
        }
        countdown.init(format.timeInSeconds(interval.time, interval.unit), countdownComplete, countdownUpdated);
    };

    /**
     *
     * @return {array} [description]
     */
    const getIntervals = () => {
        const params = router.parameters();

        if (params.length < 2) {
            return [];
        }
        const workout = workoutStore.getWorkout(params[1]);
        return workout.intervals || [];
    };

    const countdownComplete = () => {
        beep();
        window.setTimeout(beep, 200);
        nextInterval();
    };

    const countdownUpdated = (seconds) => {
        els.time.innerHTML = format.durationAsClock(seconds);
        if (seconds <= 5) {
            beep();
        }
    };

    const playPause = (e) => {
        if (timerRunning) {
            countdown.pause();
            classy.add(els.status, 'interval-timer__status--paused');
        } else {
            classy.remove(els.status, 'interval-timer__status--paused');
            countdown.start();
        }
        timerRunning = !timerRunning;
        e.preventDefault();
    };

    const attachHandlers = () => {
        el.addEventListener('click', playPause);
    };

    const removeHandlers = () => {
        el.removeEventListener('click', playPause);
    };

    const teardown = () => {
        countdown.pause();
        el.style.display = '';
        removeHandlers();
    };

    const setup = () => {
        intervals = getIntervals();

        if (!intervals || typeof(intervals.forEach) !== 'function') {
            reportError('Timer view could not read intervals.');
        }
        // Reindex array to make sure it's consecutive. Means we can shorthand some stuff later. http://stackoverflow.com/questions/4759745/javascript-reindexing-an-array
        intervals = intervals.filter((val) => val);

        el.style.display = 'block';

        els.time = el.querySelector('.current-interval__timer');
        els.action = el.querySelector('.current-interval__action');
        els.nextAction = el.querySelector('.next-interval__action');
        els.nextTime = el.querySelector('.next-interval__time');
        els.status = el.querySelector('.interval-timer__status');

        const nextUp = findInterval();
        setupInterval(nextUp.now, nextUp.next);
        initTimer(nextUp.now);
        attachHandlers();
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
