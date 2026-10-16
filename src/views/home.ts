import type { ViewBuilder } from '../Factory.ts';
import type { Plan, Workout } from '../types.ts';

/**
 * The landing page: one big "next workout" to get going with, then a few panels of context.
 *
 * A first visit goes on to the guided setup instead, until it's finished or skipped. With a guided plan, "next" is the
 * plan's next session; otherwise it follows the library order.
 */
export const home: ViewBuilder = (el, state, reportError, factory) => {
    const tools = factory.tools(),
        format = factory.format(),
        summarise = factory.summarise(),
        effort = factory.effort(),
        guided = factory.guided(),
        router = factory.router(),
        workoutStore = factory.store('workout'),
        planStore = factory.store('plan'),
        preferenceStore = factory.store('preferences');

    const upcomingCount = 3;
    // the guided plan, or null without one.
    let plan: Plan | null;

    const loadWorkouts = async () => {
        const stored = await workoutStore.getWorkouts();
        return (stored instanceof Array ? stored : [])
            .filter((workout) => workout.intervals && workout.intervals.length)
            .map((workout) => ({...workout, ...summarise(workout)}));
    };

    // a workout or session, with its summary in place of its intervals.
    type Summarised = Omit<Workout, 'intervals' | 'effortMode'> & ReturnType<typeof summarise>;

    const renderSession = (session: Summarised, plan: Plan) => {
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
    const renderProgress = (plan: Plan) => {
        const e = tools.escapeHtml,
            first = plan.results[0],
            latest = plan.results[plan.results.length - 1];
        const change = (from: number | null, to: number | null) => from !== null && to !== null && from > 0 ? ' (' + (to >= from ? '+' : '') + Math.round((to - from) / from * 100) + '%)' : '';
        const stat = (value: unknown, label: string) => '<div class="stat"><span class="stat__value">' + e(value) + '</span>' +
            '<span class="stat__label">' + e(label) + '</span></div>';
        return '<div class="stats">' +
            stat(latest.steps, 'steps, from ' + first.steps + change(first.steps, latest.steps)) +
            (latest.value ? stat(effort.describe(plan.mode, latest.value),
                'from ' + effort.describe(plan.mode, first.value) + change(first.value, latest.value)) : '') +
        '</div>' +
        '<a href="guide" class="btn">Start a new plan</a>';
    };

    const renderNext = (workout?: Summarised) => {
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

    const renderUpcoming = (workouts: Summarised[]) => {
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

    // going back through the guided setup keeps the current plan until a new one is built.
    const renderLibrary = (workouts: Summarised[]) => {
        const e = tools.escapeHtml;
        const seconds = workouts.map((workout) => workout.seconds);
        const stat = (value: unknown, label: string) => {
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
            ' <a href="guide" class="btn">Start over</a>';
    };

    const render = async () => {
        const workouts = await loadWorkouts();
        plan = await planStore.get();
        const sessions = plan ? guided.next(plan, 1 + upcomingCount).map((session) => ({...session, ...summarise(session)})) : [],
            progress = el.querySelector<HTMLElement>('.home__progress')!;

        el.querySelector('.next-workout__body')!.innerHTML = plan ? renderSession(sessions[0], plan) : renderNext(workouts[0]);
        el.querySelector('.upcoming-list')!.innerHTML = renderUpcoming((plan ? sessions : workouts).slice(1, 1 + upcomingCount));
        el.querySelector('.library-stats')!.innerHTML = renderLibrary(workouts);
        progress.hidden = !plan || plan.results.length < 2;
        if (!progress.hidden) {
            el.querySelector('.progress-stats')!.innerHTML = renderProgress(plan!);
        }
    };

    const clicked = (event: Event) => {
        const done = (event.target as Element).closest('[data-done]')?.getAttribute('data-done');
        if (done) {
            planStore.complete(done).then(render).catch((error) => reportError('Could not save your progress. ' + error));
        }
    };

    const teardown = () => {
        el.style.display = '';
        el.removeEventListener('click', clicked);
    };

    // the guide marks setup skipped when it's left without a plan, so this only sends a rider there once.
    const setup = async () => {
        const [saved, prefs] = await Promise.all([planStore.get(), preferenceStore.get()]);
        if (!saved && !prefs.start) {
            router.replace('guide');
            return;
        }
        await render();
        el.addEventListener('click', clicked);
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
