import type { ViewBuilder } from '../Factory.ts';
import type { Interval, Preferences, Unit, Workout } from '../types.ts';

export const editWorkout: ViewBuilder = (el, state, reportError, factory) => {
    const tools = factory.tools(),
        effort = factory.effort(),
        conversions = factory.conversions(),
        router = factory.router(),
        summarise = factory.summarise(),
        workoutStore = factory.store('workout'),
        preferenceStore = factory.store('preferences'),
        els = {} as {
            name: HTMLInputElement,
            start: HTMLAnchorElement,
            summary: HTMLElement,
            modes: HTMLElement,
            list: HTMLElement,
            newName: HTMLInputElement,
            newDuration: HTMLInputElement,
            newUnits: HTMLSelectElement,
            newEffort: HTMLElement,
        };
    let workout: Workout,
        prefs: Preferences;

    const loadWorkout = async (): Promise<Workout> => {
        const params = router.parameters();
        const found = params.length >= 2 && await workoutStore.getWorkout(params[1]);

        if (found) {
            found.intervals = (found.intervals || []).filter((val) => val);
            found.effortMode = effort.mode(found.effortMode).id;
            return found;
        }
        return {id: 'workout-' + Date.now(), title: '', effortMode: effort.defaultMode, intervals: []};
    };

    // the view's copy is the one being edited, so this needn't be waited on.
    const save = () => {
        workoutStore.saveWorkout(workout).catch((error) => {
            reportError('Could not save the workout. ' + error);
        });
    };

    const hasEfforts = () => {
        return workout.intervals.some((interval) => interval.effort !== null && typeof(interval.effort) !== 'undefined');
    };

    const renderModes = () => {
        const e = tools.escapeHtml;
        els.modes.innerHTML = effort.modes.map((m) => {
            return '<label class="effort-mode__option">' +
                '<input type="radio" class="effort-mode__input" name="effort-mode" value="' + e(m.id) + '"' +
                    (m.id === workout.effortMode ? ' checked' : '') + '>' +
                '<span class="effort-mode__label">' + e(m.label) + '</span>' +
            '</label>';
        }).join('');
    };

    const renderEffortControl = (id: string, value?: number | null) => {
        const e = tools.escapeHtml;
        const m = effort.mode(workout.effortMode);
        const hasValue = value !== null && typeof(value) !== 'undefined';

        if (m.type === 'scale') {
            const options = m.levels.map((level) => {
                return '<option value="' + level.value + '"' + (level.value === value ? ' selected' : '') + '>' +
                    e(level.label) + '</option>';
            }).join('');
            return '<select id="' + e(id) + '" class="input select effort-input">' +
                '<option value="">No target</option>' + options +
            '</select>';
        }

        return '<div class="effort-numeric">' +
            '<input type="number" inputmode="numeric" id="' + e(id) + '" class="input effort-input"' +
                ' min="' + m.min + '" max="' + m.max + '" placeholder="' + e(m.placeholder) + '"' +
                ' value="' + (hasValue ? e(value) : '') + '">' +
            '<span class="effort-numeric__unit">' + e(m.unit) + '</span>' +
        '</div>';
    };

    const renderInterval = (interval: Interval, index: number) => {
        const e = tools.escapeHtml;
        const id = 'interval-effort-' + index;
        return '<li class="interval-list__interval" data-index="' + index + '">' +
            '<span class="interval-list__number" aria-hidden="true">' + (index + 1) + '</span>' +
            '<div class="interval-list__details">' +
                '<h3 class="interval-list__action">' + e(interval.action) + '</h3>' +
                '<p class="interval-list__time">' + e(interval.time + ' ' + interval.unit) + '</p>' +
            '</div>' +
            '<div class="interval-list__effort">' +
                '<label class="interval-list__effort-label" for="' + id + '">' +
                    e(effort.mode(workout.effortMode).label) + '</label>' +
                renderEffortControl(id, interval.effort) +
            '</div>' +
        '</li>';
    };

    // the timer can only play a workout that has been saved with something in it.
    const renderSummary = () => {
        const summary = summarise(workout);
        els.summary.textContent = summary.intervals + ' intervals · ' + summary.duration;
        els.start.setAttribute('href', 'timer/' + workout.id);
        els.start.hidden = !summary.intervals;
    };

    const renderIntervals = () => {
        els.list.innerHTML = workout.intervals.map(renderInterval).join('');
        renderSummary();
    };

    const renderNewEffort = () => {
        els.newEffort.innerHTML =
            '<label class="block-label" for="new-interval-effort">' +
                tools.escapeHtml(effort.mode(workout.effortMode).label) + '</label>' +
            renderEffortControl('new-interval-effort', null);
    };

    const render = () => {
        els.name.value = workout.title || '';
        renderModes();
        renderIntervals();
        renderNewEffort();
    };

    const switchMode = (input: HTMLInputElement) => {
        const from = workout.effortMode,
            to = effort.mode(input.value).id;
        if (to === from) {
            return;
        }
        // Targets convert where Preferences map both modes; otherwise switching clears them.
        const convertible = conversions.available(from, prefs).includes(to);
        if (!convertible && hasEfforts() &&
            !window.confirm('There is no conversion to this effort mode set up in Preferences, so switching will ' +
                'clear the effort set on each interval. Continue?')) {
            renderModes();
            return;
        }
        workout.effortMode = to;
        workout.intervals.forEach((interval) => {
            const value = convertible ? conversions.convert(from, to, interval.effort, prefs) : null;
            if (value === null) {
                delete interval.effort;
            } else {
                interval.effort = value;
            }
        });
        save();
        renderIntervals();
        renderNewEffort();
    };

    const updateIntervalEffort = (input: HTMLInputElement | HTMLSelectElement) => {
        const item = input.closest('.interval-list__interval');
        const interval = item && workout.intervals[parseInt(item.getAttribute('data-index')!, 10)];
        if (!interval) {
            reportError('Edit view could not find the interval for an effort change.');
            return;
        }
        const value = effort.parse(workout.effortMode, input.value);
        if (value === null) {
            delete interval.effort;
        } else {
            interval.effort = value;
        }
        // Reflect any clamping back to the user.
        input.value = value === null ? '' : String(value);
        save();
    };

    const addInterval = () => {
        const time = parseInt(els.newDuration.value, 10);
        if (isNaN(time) || time <= 0) {
            els.newDuration.focus();
            return;
        }

        const interval: Interval = {
            action: els.newName.value.trim() || 'Interval',
            time: time,
            unit: els.newUnits.value as Unit,
        };
        const value = effort.parse(workout.effortMode, el.querySelector<HTMLInputElement>('#new-interval-effort')!.value);
        if (value !== null) {
            interval.effort = value;
        }

        workout.intervals.push(interval);
        save();
        renderIntervals();
        renderNewEffort();
        els.newName.value = '';
        els.newDuration.value = '';
    };

    const changed = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.name === 'effort-mode') {
            switchMode(target);
        } else if (target === els.name) {
            workout.title = target.value.trim();
            save();
        } else if (target.classList.contains('effort-input') && els.list.contains(target)) {
            updateIntervalEffort(target);
        }
    };

    const clicked = (e: Event) => {
        if ((e.target as Element).closest('.interval__add')) {
            e.preventDefault();
            addInterval();
        }
    };

    const attachHandlers = () => {
        el.addEventListener('change', changed);
        el.addEventListener('click', clicked);
    };

    const removeHandlers = () => {
        el.removeEventListener('change', changed);
        el.removeEventListener('click', clicked);
    };

    const teardown = () => {
        el.style.display = '';
        removeHandlers();
    };

    const setup = async () => {
        els.name = el.querySelector<HTMLInputElement>('#workout-name')!;
        els.start = el.querySelector<HTMLAnchorElement>('.edit-workout__start')!;
        els.summary = el.querySelector<HTMLElement>('.edit-workout__summary')!;
        els.modes = el.querySelector<HTMLElement>('.effort-mode')!;
        els.list = el.querySelector<HTMLElement>('.interval-list')!;
        els.newName = el.querySelector<HTMLInputElement>('#new-interval-name')!;
        els.newDuration = el.querySelector<HTMLInputElement>('#new-interval-duration')!;
        els.newUnits = el.querySelector<HTMLSelectElement>('#new-interval-units')!;
        els.newEffort = el.querySelector<HTMLElement>('.interval-list__actions-effort')!;

        workout = await loadWorkout();
        prefs = await preferenceStore.get();
        render();
        attachHandlers();
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
