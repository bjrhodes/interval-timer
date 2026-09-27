export const workouts = (el, state, errorReporter, factory) => {
    let workouts;
    const tools = factory.tools(),
        format = factory.format(),
        url = factory.url(),
        workoutStore = factory.store('workout');

    const totalDuration = (intervals) => {
        if (!(workouts instanceof Array)) {
            return 'Unknown duration';
        }
        const seconds = intervals.reduce((total, interval) => {
            return isNaN(1 + interval.time) ? total : total + format.timeInSeconds(interval.time, interval.unit);
        }, 0);
        return format.durationAsWords(seconds);
    };

    const loadWorkouts = () => {
        workouts = workoutStore.getWorkouts();
        if (!(workouts instanceof Array)) {
            workouts = [];
        }
        workouts.forEach((workout) => {
            workout.editTarget = url.route("editworkout/" + workout.id);
            workout.startTarget = url.route("timer/" + workout.id);
            workout.duration = totalDuration(workout.intervals);
        });
        return workouts;
    };

    const renderItem = (workout) => {
        const e = tools.escapeHtml;
        return '<li class="workout-list__workout clearfix">' +
            '<h4 class="workout-list__title">' + e(workout.title) + '</h4>' +
            '<div class="workout-list__actions">' +
                '<a href="' + e(workout.startTarget) + '" class="btn workout__start">start</a>' +
                '<a href="' + e(workout.editTarget) + '" class="btn workout__edit">edit</a>' +
            '</div>' +
            '<p class="workout-list__duration">' + e(workout.duration) + '</p>' +
        '</li>';
    };

    const teardown = () => {
        el.style.display = '';
    };
    const setup = () => {
        let html = '';
        const workouts = loadWorkouts();
        workouts.forEach((workout) => {
            html += renderItem(workout);
        });
        el.innerHTML = '<ul class="workout-list">' + html + '</ul>';
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
