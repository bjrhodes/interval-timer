var mml = mml || {};
mml.views = mml.views || {};

mml.views.timer = function (el, state, reportError, factory) {
    'use strict';

    var countdown = factory.countdown(),
        beep = factory.beep(),
        format = factory.format(),
        intervals = [],
        els = {
            time: null,
            action: null,
            nextAction: null,
            nextTime: null,
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


    function nextInterval() {
        var now, next, duration;
        if (intervals.length === 0) {
            els.nextAction.innerHTML = "-";
            els.action.innerHTML = '-';
            els.time.innerHTML = 'FIN';
        }
        now = intervals.shift();
        next = intervals.length ? intervals[0] : false;

        setupInterval(now, next);
        countdown(format.timeInSeconds(now.time, now.unit), countdownComplete, countdownUpdated);
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

    function teardown() {
        el.style.display = '';
    }
    function setup() {
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

        nextInterval();
    }

    return {
        teardown: teardown,
        setup: setup,
    };
};
