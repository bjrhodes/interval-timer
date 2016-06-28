/* global mml*/
(function() {
    'use strict';
    var config = {
        routes : new mml.utilities.enumerable([
            {hash: '',            view: 'workouts',    id: 'workouts',    description: 'View all workouts'},
            {hash: 'timer',       view: 'timer',       id: 'timer',       description: 'The workout timer'},
            {hash: 'editworkout', view: 'editWorkout', id: 'edit-workout', description: 'Edit workout'},
        ])
    };

    var factory = new mml.Factory(config);
    factory.controller().run();
})();
