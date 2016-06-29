/* global mml*/
(function() {
    'use strict';
    var intervals = [
            {action: '10 m/h (warmup)', time: 10, unit: 'minutes'},
            {action: '14 m/h (warmup)', time: 10, unit: 'minutes'},
            {action: '18 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 1, unit: 'minutes'},
            {action: '19 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 1, unit: 'minutes'},
            {action: '20 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 1, unit: 'minutes'},
            {action: '21 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 1, unit: 'minutes'},
            {action: '22 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 3, unit: 'minutes'},
            {action: '18 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 1, unit: 'minutes'},
            {action: '19 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 1, unit: 'minutes'},
            {action: '20 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 1, unit: 'minutes'},
            {action: '21 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 1, unit: 'minutes'},
            {action: '22 m/h', time: 1, unit: 'minutes'},
            {action: '14 m/h (recovery)', time: 3, unit: 'minutes'},
            {action: '10 m/h (cooldown)', time: 10, unit: 'minutes'},
        ],
        config = {
            routes : new mml.utilities.enumerable([
                {hash: '',            view: 'workouts',    id: 'workouts',    description: 'View all workouts'},
                {hash: 'timer',       view: 'timer',       id: 'timer',       description: 'The workout timer'},
                {hash: 'editworkout', view: 'editWorkout', id: 'edit-workout', description: 'Edit workout'},
            ]),
        },
        state = {
            intervals: intervals
        },
        factory = new mml.Factory(config, state);

    factory.controller().run();
})();
