/* global mml*/
(function() {
    'use strict';
    var config = {
            routes : new mml.utilities.enumerable([
                {hash: '',            view: 'workouts',    id: 'workouts',    description: 'View all workouts'},
                {hash: /^timer(\/.*)?/,       view: 'timer',       id: 'timer',       description: 'The workout timer'},
                {hash: '^editworkout(\/.*)?', view: 'editWorkout', id: 'edit-workout', description: 'Edit workout'},
            ]),
        },
        state = {workouts: workouts},
        factory = new mml.Factory(config, state);

    factory.controller().run();
})();
