var mml = mml || {};
mml.views = mml.views || {};

mml.views.timer = function (el, state, reportError, factory) {
    'use strict';

    var countdown = factory.countdown(),
        beep = factory.beep(),
        intervals = [],
        els = {
            time: null,
            action: null,
            nextAction: null,
            nextTime: null,
        };

    function timeInSeconds(time, units) {
        switch (units) {
            case 'hours':
                time = time * 60;
                // intentional fallthrough. Should accumulate actions
            case 'minutes':
                time = time * 60;
        }

        return time;
    }

    function setupInterval(action, duration, next) {
        els.time.innerHTML = formattedTime(duration);
        els.action.innerHTML = action;

        if (next.action && next.time && next.unit) {
            els.nextAction.innerHTML = next.action;
            els.nextTime.innerHTML = '(' + formattedTime(timeInSeconds(next.time, next.unit)) + ')';
        } else {
            els.nextAction.innerHTML = "Completed";
            els.nextTime.innerHTML = '-';
        }
    }

    function zeropad(num) {
        var str = '' + num;
        if (num === 0) {
            return '00';
        }
        return (str.length === 1) ? '0' + str : str;
    }

    function formattedTime(seconds) {
        var minutes, hours;
        if (seconds < 60) {
            return seconds + 's';
        }
        minutes = Math.floor(seconds / 60);
        seconds = seconds - (minutes * 60);
        if (minutes < 60) {
            return minutes + ':' + zeropad(seconds);
        }

        hours = Math.floor(minutes / 60);
        minutes = minutes - (hours * 60);

        return hours + ':' + zeropad(minutes) + ':' + zeropad(seconds);
    }

    function nextInterval() {
        var now = intervals.shift();
        var next = intervals.length ? intervals[0] : false;

        var duration = timeInSeconds(now.time, now.unit);

        setupInterval(now.action, duration, next);

        countdown(duration, countdownComplete, countdownUpdated);
    }

    function countdownComplete() {
        els.time.innerHTML = 'FIN';
        beep();
        window.setTimeout(beep, 200);
    }

    function countdownUpdated(seconds) {
        els.time.innerHTML = formattedTime(seconds);
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
