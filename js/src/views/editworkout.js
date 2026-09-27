window.mml = window.mml || {};
mml.views = mml.views || {};

mml.views.editWorkout = (el) => {
    'use strict';

    const teardown = () => {
        el.style.display = '';
    };
    const setup = () => {
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
