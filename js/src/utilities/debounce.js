var mml = mml || {};
mml.utilities = mml.utilities || {};

/**
 * This slows firing to at most once every interval.
 *
 */
mml.utilities.Debounce = function(window) {
    'use strict';
    var running = [];

    return function(fn, time, identifier) {
        var findTimer = function(id) {
            return (id === identifier);
        };
        var removeTimer = function(id, index) {
            if (id === identifier) {
                running.splice(index, 1);
                return true;
            }
        };
        var runAndClear = function() {
            fn();
            running.some(removeTimer);
        };

        if (running.some(findTimer)) {
            return; // if a timer is already set, let it run
        }

        running.push(identifier);
        window.setTimeout(runAndClear, time);
    };
};
