var mml = mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.Countdown = function() {

    var complete,
        update,
        clearCurrent,
        targetTime,
        currentCount = 0;

    function tickDown() {
        currentCount--;
        targetTime = targetTime + 1000;
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

    // Sets a target of 1 second into the future and starts a timer. Using requestAnimationFrame for better accuracy than
    // the easier-to-read setTimeout.
    return function (countTo, callback, notify) {
        var now = window.performance.now();
        if (clearCurrent) {
            window.cancelAnimationFrame(clearCurrent);
        }
        if (countTo <= 0) {
            return callback();
        }

        complete = callback;
        update = notify;
        currentCount = countTo;
        targetTime = now + 1000;
        runTimer();
    };
};
