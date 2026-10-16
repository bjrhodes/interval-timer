import type { ViewBuilder } from '../Factory.ts';

export const workouts: ViewBuilder = (el, state, reportError, factory) => {
    const tools = factory.tools(),
        summarise = factory.summarise(),
        workoutStore = factory.store('workout'),
        els = {} as {
            list: HTMLElement,
            status: HTMLElement,
        };

    const loadWorkouts = async () => {
        const stored = await workoutStore.getWorkouts();
        return (stored instanceof Array ? stored : []).map((workout) => ({
            ...workout,
            ...summarise(workout),
            editTarget: "editworkout/" + workout.id,
            startTarget: "timer/" + workout.id,
        }));
    };

    type Listed = Awaited<ReturnType<typeof loadWorkouts>>[number];

    const renderItem = (workout: Listed) => {
        const e = tools.escapeHtml;
        return '<li class="workout-list__workout card">' +
            '<h2 class="workout-list__title">' + e(workout.title || 'Untitled workout') + '</h2>' +
            '<p class="workout-list__duration">' + e(workout.duration) + '</p>' +
            '<p class="workout-list__meta muted">' +
                e(workout.intervals + ' intervals · ' + workout.effortMode) + '</p>' +
            '<div class="workout-list__actions">' +
                '<a href="' + e(workout.startTarget) + '" class="btn btn--primary workout__start">Start</a>' +
                '<a href="' + e(workout.editTarget) + '" class="btn workout__edit">Edit</a>' +
                '<button type="button" class="btn workout__delete" data-id="' + e(workout.id) + '"' +
                    ' data-title="' + e(workout.title || 'Untitled workout') + '">Delete</button>' +
            '</div>' +
        '</li>';
    };

    const render = async () => {
        const workouts = await loadWorkouts();
        els.list.innerHTML = workouts.length
            ? workouts.map(renderItem).join('')
            : '<li class="muted">No workouts yet.</li>';
    };

    const say = (message: string) => {
        els.status.textContent = message;
    };

    const deleteWorkout = async (button: Element) => {
        if (!window.confirm('Delete "' + button.getAttribute('data-title') + '"? This cannot be undone.')) {
            return;
        }
        await workoutStore.deleteWorkout(button.getAttribute('data-id')!);
        say('Deleted "' + button.getAttribute('data-title') + '".');
        await render();
    };

    const exportWorkouts = async () => {
        const data = await workoutStore.exportWorkouts();
        const href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = href;
        link.download = 'interval-timer-workouts-' + data.exportedAt.slice(0, 10) + '.json';
        link.click();
        URL.revokeObjectURL(href);
        say('Exported ' + data.workouts.length + ' workouts.');
    };

    const importWorkouts = async (input: HTMLInputElement) => {
        const file = input.files![0];
        // cleared so choosing the same file again still counts as a change.
        input.value = '';
        if (!file) {
            return;
        }

        let data;
        try {
            data = JSON.parse(await file.text());
        } catch {
            say('That file could not be read. Choose a file exported from this app.');
            return;
        }
        const count = data && Array.isArray(data.workouts) ? data.workouts.length : 0;
        if (count && !window.confirm('Import ' + count + ' workouts? Workouts you already have with the same id will be replaced.')) {
            return;
        }

        try {
            const result = await workoutStore.importWorkouts(data);
            say('Imported ' + result.imported + ' workouts' + (result.skipped ? ', skipped ' + result.skipped + ' that were not valid.' : '.'));
        } catch (error) {
            say((error as Error).message);
            return;
        }
        await render();
    };

    // reports anything unexpected, as these run outside the view's setup.
    const guarded = (action: Promise<unknown>) => {
        action.catch((error: unknown) => {
            say('Something went wrong. Please try again.');
            reportError('Workouts view: ' + error);
        });
    };

    const clicked = (e: Event) => {
        const target = e.target as Element,
            del = target.closest('.workout__delete');
        if (del) {
            guarded(deleteWorkout(del));
        } else if (target.closest('.workouts__export')) {
            guarded(exportWorkouts());
        }
    };

    const changed = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.classList.contains('workouts__import-file')) {
            guarded(importWorkouts(target));
        }
    };

    const teardown = () => {
        el.style.display = '';
        el.removeEventListener('click', clicked);
        el.removeEventListener('change', changed);
    };

    const setup = async () => {
        els.list = el.querySelector<HTMLElement>('.workout-list')!;
        els.status = el.querySelector<HTMLElement>('.workouts__status')!;
        say('');
        await render();
        el.addEventListener('click', clicked);
        el.addEventListener('change', changed);
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
