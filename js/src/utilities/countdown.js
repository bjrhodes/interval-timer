var mml = mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.Countdown = function() {

    var complete,
        update,
        clearCurrent,
        targetTime,
        msRemaining, // this one is here to allow for more accurate pauses
        currentCount = 0;

    function tickDown() {
        currentCount--;
        msRemaining = 1000;
        targetTime = targetTime + msRemaining;
        if (typeof(update) === 'function') {
            update(currentCount);
        }
    }

    // Checks if we've hit our target, and if so ticks down a second
    function runTimer() {
        if (targetTime <= window.performance.now()) {
            tickDown();
            if (currentCount === 0) {
                // break out of the timer once count is zero'd
                return complete();
            }
        }

        clearCurrent = window.requestAnimationFrame(runTimer);
    }

    function pause() {
        var now;
        if (clearCurrent) {
            window.cancelAnimationFrame(clearCurrent);
            now = window.performance.now();
            msRemaining = targetTime - now;
        }
    }

    // Sets a target of 1 second into the future and starts a timer. Using requestAnimationFrame for better accuracy than
    // the easier-to-read setTimeout.
    return {
        init: function (countTo, callback, notify) {
            pause();
            if (countTo <= 0) {
                return callback();
            }

            complete = callback;
            update = notify;
            currentCount = countTo;
            msRemaining = 1000;
        },
        start: function () {
            var now = window.performance.now();
            targetTime = now + msRemaining;
            if (currentCount > 0) {
                runTimer();
            }
        },
        pause: pause
    }
};
