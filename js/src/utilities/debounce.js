window.mml = window.mml || {};
mml.utilities = mml.utilities || {};

/**
 * This slows firing to at most once every interval.
 *
 */
mml.utilities.Debounce = (window) => {
    'use strict';
    const running = [];

    return (fn, time, identifier) => {
        const findTimer = (id) => {
            return (id === identifier);
        };
        const removeTimer = (id, index) => {
            if (id === identifier) {
                running.splice(index, 1);
                return true;
            }
        };
        const runAndClear = () => {
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
