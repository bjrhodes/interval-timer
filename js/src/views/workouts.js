var mml = mml || {};
mml.views = mml.views || {};

mml.views.workouts = function (el, state, errorReporter, factory) {
    'use strict';

    var workouts;
    var tools = factory.tools(),
        format = factory.format(),
        workoutStore = factory.store('workout');

    function totalDuration(intervals) {
        var seconds;
        if (!(workouts instanceof Array)) {
            return 'Unknown duration';
        }
        seconds = intervals.reduce(function(total, interval) {
            return isNaN(1 + interval.time) ? total : total + format.timeInSeconds(interval.time, interval.unit);
        }, 0);
        return format.durationAsWords(seconds);
    }

    function loadWorkouts() {
        workouts = workoutStore.getWorkouts();
        if (!(workouts instanceof Array)) {
            workouts = [];
        }
        workouts.forEach(function(workout) {
            workout.editTarget = "/#editworkout/" + workout.id;
            workout.startTarget = "/#timer/" + workout.id;
            workout.duration = totalDuration(workout.intervals);
        });
        return workouts;
    }

    function renderItem(workout) {
        var e = tools.escapeHtml;
        return '<li class="workout-list__workout clearfix">' +
            '<h4 class="workout-list__title">' + e(workout.title) + '</h4>' +
            '<div class="workout-list__actions">' +
                '<a href="' + e(workout.startTarget) + '" class="btn workout__start">start</a>' +
                '<a href="' + e(workout.editTarget) + '" class="btn workout__edit">edit</a>' +
            '</div>' +
            '<p class="workout-list__duration">' + e(workout.duration) + '</p>' +
        '</li>';
    }

    function teardown() {
        el.style.display = '';
    }
    function setup() {
        var workouts,
            html = '';
        workouts = loadWorkouts();
        workouts.forEach(function(workout) {
            html += renderItem(workout);
        });
        el.innerHTML = '<ul class="workout-list">' + html + '</ul>';
        el.style.display = 'block';
    }

    return {
        teardown: teardown,
        setup: setup,
    };
};
