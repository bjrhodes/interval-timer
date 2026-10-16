/**
 * The landing page: one big "next workout" to get going with, then a few panels of context.
 *
 * A first visit asks how to train instead. With a guided plan, "next" is the plan's next session; otherwise it
 * follows the library order.
 */
export const home = (el, state, reportError, factory) => {
    const tools = factory.tools(),
        format = factory.format(),
        summarise = factory.summarise(),
        effort = factory.effort(),
        guided = factory.guided(),
        workoutStore = factory.store('workout'),
        planStore = factory.store('plan'),
        preferenceStore = factory.store('preferences');

    const upcomingCount = 3;
    // the guided plan, or null without one.
    let plan;

    const loadWorkouts = async () => {
        const stored = await workoutStore.getWorkouts();
        return (stored instanceof Array ? stored : [])
            .filter((workout) => workout.intervals && workout.intervals.length)
            .map((workout) => ({...workout, ...summarise(workout)}));
    };

    // @extend a self-made plan only opens the library for now; it could schedule the rider's own workouts.
    const renderChooser = () => {
        const e = tools.escapeHtml;
        const choice = (tag, attrs, title, text) => '<' + tag + ' class="choice" ' + attrs + '>' +
            '<span class="choice__title">' + e(title) + '</span>' +
            '<span class="choice__text">' + e(text) + '</span>' +
        '</' + tag + '>';
        return '<h1 class="next-workout__title">How do you want to train?</h1>' +
            '<div class="choices">' +
                choice('a', 'href="guide"', 'Guided plan',
                    'New to intervals? Follow a plan built around you.') +
                choice('a', 'href="workouts" data-start="self"', 'Self-made plan',
                    'Build your own workouts from the library.') +
                choice('button', 'type="button" data-start="oneOff"', 'One-off training',
                    'Pick a workout and go.') +
            '</div>';
    };

    const renderSession = (session, plan) => {
        const e = tools.escapeHtml;
        const actions = session.test
            ? '<a href="' + e('timer/' + session.id) + '" class="btn btn--primary btn--large">Start test</a>' +
                '<a href="guide/result" class="btn btn--large">Enter result</a>'
            : '<a href="' + e('timer/' + session.id) + '" class="btn btn--primary btn--large">Start workout</a>' +
                '<button type="button" class="btn btn--large" data-done="' + e(session.id) + '">Mark done</button>';
        return '<h1 class="next-workout__title">' + e(session.title) + '</h1>' +
            '<p class="next-workout__meta">' +
                '<span class="next-workout__duration">' + e(session.duration) + '</span>' +
                '<span>' + e(session.test ? 'Calibration test' : 'Level ' + plan.level) + '</span>' +
            '</p>' +
            '<div class="next-workout__actions">' + actions + '</div>';
    };

    // the first test against the latest, once there's been a retest.
    const renderProgress = (plan) => {
        const e = tools.escapeHtml,
            first = plan.results[0],
            latest = plan.results[plan.results.length - 1];
        const change = (from, to) => from > 0 ? ' (' + (to >= from ? '+' : '') + Math.round((to - from) / from * 100) + '%)' : '';
        const stat = (value, label) => '<div class="stat"><span class="stat__value">' + e(value) + '</span>' +
            '<span class="stat__label">' + e(label) + '</span></div>';
        return '<div class="stats">' +
            stat(latest.steps, 'steps, from ' + first.steps + change(first.steps, latest.steps)) +
            (latest.value ? stat(effort.describe(plan.mode, latest.value),
                'from ' + effort.describe(plan.mode, first.value) + change(first.value, latest.value)) : '') +
        '</div>' +
        '<a href="guide" class="btn">Start a new plan</a>';
    };

    const renderNext = (workout) => {
        const e = tools.escapeHtml;
        if (!workout) {
            return '<h1 class="next-workout__title">Nothing planned</h1>' +
                '<p class="next-workout__meta">Create a workout to get started.</p>' +
                '<div class="next-workout__actions">' +
                    '<a href="editworkout" class="btn btn--primary btn--large">New workout</a>' +
                '</div>';
        }
        return '<h1 class="next-workout__title">' + e(workout.title || 'Untitled workout') + '</h1>' +
            '<p class="next-workout__meta">' +
                '<span class="next-workout__duration">' + e(workout.duration) + '</span>' +
                '<span>' + e(workout.intervals + ' intervals') + '</span>' +
                '<span>' + e(workout.effortMode) + '</span>' +
            '</p>' +
            '<div class="next-workout__actions">' +
                '<a href="' + e('timer/' + workout.id) + '" class="btn btn--primary btn--large">Start workout</a>' +
                '<a href="' + e('editworkout/' + workout.id) + '" class="btn btn--large">Edit</a>' +
            '</div>';
    };

    const renderUpcoming = (workouts) => {
        const e = tools.escapeHtml;
        if (!workouts.length) {
            return '<li class="muted">Nothing else in the library yet.</li>';
        }
        return workouts.map((workout) => {
            return '<li class="upcoming-list__item">' +
                '<a href="' + e('timer/' + workout.id) + '" class="upcoming-list__link">' +
                    '<span class="upcoming-list__title">' + e(workout.title || 'Untitled workout') + '</span>' +
                    '<span class="upcoming-list__time muted">' + e(format.durationAsClock(workout.seconds)) + '</span>' +
                '</a>' +
            '</li>';
        }).join('');
    };

    // a rider who went their own way can still take up a guided plan.
    const renderLibrary = (workouts, offerGuide) => {
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
            '<a href="workouts" class="btn">Browse workouts</a>' +
            (offerGuide ? ' <a href="guide" class="btn">Guided plan</a>' : '');
    };

    const render = async () => {
        const [workouts, prefs] = await Promise.all([loadWorkouts(), preferenceStore.get()]);
        plan = await planStore.get();
        const sessions = plan ? guided.next(plan, 1 + upcomingCount).map((session) => ({...session, ...summarise(session)})) : [],
            choosing = !plan && !prefs.start,
            progress = el.querySelector('.home__progress');

        el.querySelector('.next-workout .eyebrow').textContent = choosing ? 'Welcome' : 'Next workout';
        el.querySelector('.next-workout__body').innerHTML = choosing ? renderChooser()
            : plan ? renderSession(sessions[0], plan) : renderNext(workouts[0]);
        el.querySelector('.home__upcoming').hidden = choosing;
        el.querySelector('.upcoming-list').innerHTML = renderUpcoming((plan ? sessions : workouts).slice(1, 1 + upcomingCount));
        el.querySelector('.library-stats').innerHTML = renderLibrary(workouts, !plan && !choosing);
        progress.hidden = !plan || plan.results.length < 2;
        if (!progress.hidden) {
            el.querySelector('.progress-stats').innerHTML = renderProgress(plan);
        }
    };

    // the self-made link goes on to the library, while the save finishes behind it.
    const start = async (choice) => {
        const prefs = await preferenceStore.get();
        await preferenceStore.save({...prefs, start: choice});
        if (choice === 'oneOff') {
            await render();
        }
    };

    const clicked = (event) => {
        const target = event.target.closest('[data-start], [data-done]');
        if (!target) {
            return;
        }
        const done = target.getAttribute('data-done'),
            saving = done ? planStore.complete(done).then(render) : start(target.getAttribute('data-start'));
        saving.catch((error) => reportError('Could not save your choice. ' + error));
    };

    const teardown = () => {
        el.style.display = '';
        el.removeEventListener('click', clicked);
    };

    const setup = async () => {
        await render();
        el.addEventListener('click', clicked);
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
