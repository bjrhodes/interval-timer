var mml = mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.countdown = function() {

    var complete,
        update,
        clearCurrent,
        currentCount = 0;

    function tickDown() {
        if (currentCount === 0) {
            return complete();
        }
        if (typeof(update) === 'function') {
            update(currentCount);
        }
        currentCount--;
        clearCurrent = window.setTimeout(tickDown, 1000);
    }

    return function (countTo, callback, notify) {
        window.clearTimeout(clearCurrent);
        complete = callback;
        update = notify;
        currentCount = countTo;
        tickDown();
    };
};
