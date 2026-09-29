/**
 * The landing page: one big "next workout" to get going with, then a few panels of context.
 *
 * Until there's a schedule and a history to recommend from, "next" simply follows the library order.
 */
export const home = (el, state, reportError, factory) => {
    const tools = factory.tools(),
        format = factory.format(),
        summarise = factory.summarise(),
        url = factory.url(),
        workoutStore = factory.store('workout');

    const upcomingCount = 3;

    const loadWorkouts = async () => {
        const stored = await workoutStore.getWorkouts();
        return (stored instanceof Array ? stored : [])
            .filter((workout) => workout.intervals && workout.intervals.length)
            .map((workout) => ({...workout, ...summarise(workout)}));
    };

    const renderNext = (workout) => {
        const e = tools.escapeHtml;
        if (!workout) {
            return '<h1 class="next-workout__title">Nothing planned</h1>' +
                '<p class="next-workout__meta">Create a workout to get started.</p>' +
                '<div class="next-workout__actions">' +
                    '<a href="' + e(url.route('editworkout')) + '" class="btn btn--primary btn--large">New workout</a>' +
                '</div>';
        }
        return '<h1 class="next-workout__title">' + e(workout.title || 'Untitled workout') + '</h1>' +
            '<p class="next-workout__meta">' +
                '<span class="next-workout__duration">' + e(workout.duration) + '</span>' +
                '<span>' + e(workout.intervals + ' intervals') + '</span>' +
                '<span>' + e(workout.effortMode) + '</span>' +
            '</p>' +
            '<div class="next-workout__actions">' +
                '<a href="' + e(url.route('timer/' + workout.id)) + '" class="btn btn--primary btn--large">Start workout</a>' +
                '<a href="' + e(url.route('editworkout/' + workout.id)) + '" class="btn btn--large">Edit</a>' +
            '</div>';
    };

    const renderUpcoming = (workouts) => {
        const e = tools.escapeHtml;
        if (!workouts.length) {
            return '<li class="muted">Nothing else in the library yet.</li>';
        }
        return workouts.map((workout) => {
            return '<li class="upcoming-list__item">' +
                '<a href="' + e(url.route('timer/' + workout.id)) + '" class="upcoming-list__link">' +
                    '<span class="upcoming-list__title">' + e(workout.title || 'Untitled workout') + '</span>' +
                    '<span class="upcoming-list__time muted">' + e(format.durationAsClock(workout.seconds)) + '</span>' +
                '</a>' +
            '</li>';
        }).join('');
    };

    const renderLibrary = (workouts) => {
        const e = tools.escapeHtml;
        const seconds = workouts.map((workout) => workout.seconds);
        const stat = (value, label) => {
            return '<div class="stat"><span class="stat__value">' + e(value) + '</span>' +
                '<span class="stat__label">' + e(label) + '</span></div>';
        };
        const stats = seconds.length
            ? stat(workouts.length, 'workouts') +
                stat(format.durationAsClock(Math.min(...seconds)), 'shortest') +
                stat(format.durationAsClock(Math.max(...seconds)), 'longest')
            : stat(0, 'workouts');

        return '<div class="stats">' + stats + '</div>' +
            '<a href="' + e(url.route('workouts')) + '" class="btn">Browse workouts</a>';
    };

    const teardown = () => {
        el.style.display = '';
    };

    const setup = async () => {
        const workouts = await loadWorkouts();
        el.querySelector('.next-workout__body').innerHTML = renderNext(workouts[0]);
        el.querySelector('.upcoming-list').innerHTML = renderUpcoming(workouts.slice(1, 1 + upcomingCount));
        el.querySelector('.library-stats').innerHTML = renderLibrary(workouts);
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
