var mml = mml || {};
mml.views = mml.views || {};

mml.views.timer = function (el, countdown, beep) {
    'use strict';

    var time;

    function countdownComplete() {
        time.innerHTML = 'FIN';
        beep();
        window.setTimeout(beep, 275);
    }

    function countdownUpdated(seconds) {
        time.innerHTML = seconds + 's';
        if (seconds <= 5) {
            beep();
        }
    }

    function teardown() {
        el.style.display = '';
    }
    function setup() {
        el.style.display = 'block';
        time = el.querySelector('.current-interval__timer');

        countdown(7, countdownComplete, countdownUpdated);
    }

    return {
        teardown: teardown,
        setup: setup,
    };
};
