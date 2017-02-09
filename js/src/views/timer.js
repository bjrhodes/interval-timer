var mml = mml || {};
mml.views = mml.views || {};

mml.views.timer = function (el, state, reportError, factory) {
    'use strict';

    var countdown = factory.countdown(),
        beep = factory.beep(),
        format = factory.format(),
        intervals = [],
        timerRunning = false,
        els = {
            time: null,
            action: null,
            nextAction: null,
            nextTime: null,
            status: null
        };


    function setupInterval(now, next) {
        els.time.innerHTML = format.duration(format.timeInSeconds(now.time, now.unit));
        els.action.innerHTML = now.action;

        if (next.action && next.time && next.unit) {
            els.nextAction.innerHTML = next.action;
            els.nextTime.innerHTML = '(' + format.duration(format.timeInSeconds(next.time, next.unit)) + ')';
        } else {
            els.nextAction.innerHTML = "Completed";
            els.nextTime.innerHTML = '-';
        }
    }

    function findInterval() {
        var now, next, duration;
        if (intervals.length === 0) {
            els.nextAction.innerHTML = "-";
            els.action.innerHTML = '-';
            els.time.innerHTML = 'FIN';
        }
        now = intervals.shift();
        next = intervals.length ? intervals[0] : false;
        return {now: now, next: next};
    }

    function nextInterval() {
        var nextUp = findInterval();
        setupInterval(nextUp.now, nextUp.next);
        initTimer(nextUp.now);
        countdown.start();
    }

    function initTimer(interval) {
        countdown.init(format.timeInSeconds(interval.time, interval.unit), countdownComplete, countdownUpdated);
    }

    function countdownComplete() {
        beep();
        window.setTimeout(beep, 200);
        nextInterval();
    }

    function countdownUpdated(seconds) {
        els.time.innerHTML = format.duration(seconds);
        if (seconds <= 5) {
            beep();
        }
    }

    function playPause(e) {
        if (timerRunning) {
            countdown.pause();
            els.status.classList.add('interval-timer__status--paused');
        } else {
            els.status.classList.remove('interval-timer__status--paused');
            countdown.start();
        }
        timerRunning = !timerRunning;
        e.preventDefault();
    }

    function attachHandlers() {
        el.addEventListener('click', playPause);
    }

    function removeHandlers() {
        el.removeEventListener('click', playPause);
    }

    function teardown() {
        el.style.display = '';
        removeHandlers();
    }

    function setup() {
        var nextUp;
        intervals = JSON.parse(JSON.stringify(state.intervals));

        if (!intervals || typeof(intervals.forEach) !== 'function') {
            reportError('Timer view could not read intervals.');
        }
        // Reindex array to make sure it's consecutive. Means we can shorthand some stuff later. http://stackoverflow.com/questions/4759745/javascript-reindexing-an-array
        intervals = intervals.filter(function(val){return val});

        el.style.display = 'block';

        els.time = el.querySelector('.current-interval__timer');
        els.action = el.querySelector('.current-interval__action');
        els.nextAction = el.querySelector('.next-interval__action');
        els.nextTime = el.querySelector('.next-interval__time');
        els.status = el.querySelector('.interval-timer__status');

        nextUp = findInterval();
        setupInterval(nextUp.now, nextUp.next);
        initTimer(nextUp.now);
        attachHandlers();
    }

    return {
        teardown: teardown,
        setup: setup,
    };
};
