export const workouts = (el, state, errorReporter, factory) => {
    const tools = factory.tools(),
        summarise = factory.summarise(),
        url = factory.url(),
        workoutStore = factory.store('workout');

    const loadWorkouts = () => {
        const stored = workoutStore.getWorkouts();
        return (stored instanceof Array ? stored : []).map((workout) => ({
            ...workout,
            ...summarise(workout),
            editTarget: url.route("editworkout/" + workout.id),
            startTarget: url.route("timer/" + workout.id),
        }));
    };

    const renderItem = (workout) => {
        const e = tools.escapeHtml;
        return '<li class="workout-list__workout card">' +
            '<h2 class="workout-list__title">' + e(workout.title || 'Untitled workout') + '</h2>' +
            '<p class="workout-list__duration">' + e(workout.duration) + '</p>' +
            '<p class="workout-list__meta muted">' +
                e(workout.intervals + ' intervals · ' + workout.effortMode) + '</p>' +
            '<div class="workout-list__actions">' +
                '<a href="' + e(workout.startTarget) + '" class="btn btn--primary workout__start">Start</a>' +
                '<a href="' + e(workout.editTarget) + '" class="btn workout__edit">Edit</a>' +
            '</div>' +
        '</li>';
    };

    const teardown = () => {
        el.style.display = '';
    };
    const setup = () => {
        el.querySelector('.workout-list').innerHTML = loadWorkouts().map(renderItem).join('');
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
