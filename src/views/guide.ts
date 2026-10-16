import type { ViewBuilder } from '../Factory.ts';
import type { Plan, TestId } from '../types.ts';
import type { NumericMode } from '../utilities/effort.ts';

type Step = 'metric' | 'sessions' | 'test' | 'ready';

/**
 * Starts a guided plan: what the rider measures effort with, which test to calibrate by, then off to the test. By
 * feel there's nothing to calibrate, so it asks the sessions a week and builds the plan straight away.
 * `guide/result` takes the test's result, which builds the plan, or moves it on to its next block after a retest.
 */
export const guide: ViewBuilder = (el, state, reportError, factory) => {
    const tools = factory.tools(),
        effort = factory.effort(),
        guided = factory.guided(),
        router = factory.router(),
        planStore = factory.store('plan'),
        preferenceStore = factory.store('preferences'),
        metrics = [
            {mode: 'perceived', title: 'Just how it feels', text: 'No kit needed. Targets are effort out of 10.'},
            {mode: 'heartRate', title: 'Heart rate monitor', text: 'A chest strap or watch showing beats per minute.'},
            {mode: 'speedKmh', title: 'Speed in km/h', text: 'A bike computer. Best on a turbo trainer or a flat, quiet road.'},
            {mode: 'speedMph', title: 'Speed in mph', text: 'A bike computer. Best on a turbo trainer or a flat, quiet road.'},
            {mode: 'power', title: 'Power meter', text: 'Watts from a smart trainer or power meter.'},
        ],
        tests = [
            {id: 'ramp', title: 'Ramp test', text: 'About 35 minutes. Each minute is a little harder, until you can\'t keep going. The most accurate.'},
            {id: 'talk', title: 'Gentle talk test', text: 'About 35 minutes. Each 2 minutes is a little harder, and you stop once talking gets hard. No all-out effort.'},
        ];
    let body: HTMLElement,
        step: Step,
        choice: {mode?: string, test?: TestId};

    const e = (str: unknown) => tools.escapeHtml(str);

    const measured = (mode: string) => mode !== 'perceived';

    // only asked of measured modes, which are all numeric.
    const unitOf = (mode: string) => (effort.mode(mode) as NumericMode).unit;

    // e.g. "power" or "speed (km/h)", for prose.
    const nameOf = (mode: string) => effort.mode(mode).label.toLowerCase();

    const choices = <T extends {title: string, text: string}>(items: T[], attr: string, key: keyof T) => '<div class="choices">' + items.map((item) =>
        '<button type="button" class="choice" data-' + attr + '="' + e(item[key]) + '">' +
            '<span class="choice__title">' + e(item.title) + '</span>' +
            '<span class="choice__text">' + e(item.text) + '</span>' +
        '</button>').join('') + '</div>';

    const back = '<button type="button" class="btn guide__back" data-back>Back</button>';

    const renderMetric = () => '<p class="eyebrow">Guided plan</p>' +
        '<h1 class="guide__title">What can you measure effort with?</h1>' +
        '<p class="muted">Pick the best you have to hand. With kit, a short test sets your targets first; by feel, your plan starts straight away.</p>' +
        choices(metrics, 'mode', 'mode');

    const renderTest = () => '<p class="eyebrow">Guided plan</p>' +
        '<h1 class="guide__title">Pick your test</h1>' +
        '<p class="muted">You\'ll take the same test every 4 weeks, to see how far you\'ve come.</p>' +
        choices(tests, 'test', 'id') +
        '<p class="guide__note">The ramp test ends in an all-out effort. If you\'re new to exercise, have a heart condition ' +
            'or aren\'t sure, choose the gentle test or check with a doctor first.</p>' +
        back;

    const instructions = (test: TestId, mode: string) => {
        const unit = measured(mode) ? nameOf(mode) : null;
        if (test === 'ramp') {
            return 'Warm up for 10 minutes, then follow the steps. Each minute is a little harder. Keep going until you ' +
                'can\'t hold the step, then ease off and exit the timer. Note how many steps you finished' +
                (unit ? ', and your ' + unit + ' over the last full step.' : '.');
        }
        return 'Warm up for 10 minutes, then follow the steps. Each 2 minutes is a little harder. Halfway through each ' +
            'step, say a full sentence out loud. Once you can\'t say it comfortably, note the step' +
            (unit ? ' and your ' + unit : '') + ', then ease off and exit the timer.';
    };

    const sessionsField = '<div class="field">' +
        '<label class="block-label" for="guide-sessions">Sessions a week you can manage</label>' +
        '<select id="guide-sessions" class="input select guide__sessions" aria-describedby="guide-sessions-help">' +
            [2, 3, 4].map((n) => '<option value="' + n + '"' + (n === 3 ? ' selected' : '') + '>' + n + '</option>').join('') +
        '</select>' +
        '<p id="guide-sessions-help" class="muted">A session is one ride, warm-up included. They start at about 30 ' +
            'minutes and build towards an hour or more as you level up.</p>' +
    '</div>';

    const renderSessions = () => '<p class="eyebrow">Guided plan</p>' +
        '<h1 class="guide__title">How often can you ride?</h1>' +
        '<p class="muted">Targets are effort out of 10, so there\'s nothing to test. Your plan starts at level 1 and ' +
            'steps up every 4 weeks.</p>' +
        '<form class="guide__form">' +
            sessionsField +
            '<button type="submit" class="btn btn--primary btn--large">Build my plan</button>' +
        '</form>' +
        back;

    const renderReady = () => '<p class="eyebrow">Guided plan</p>' +
        '<h1 class="guide__title">Ready for your ' + e(guided.tests[choice.test!].name.toLowerCase()) + '</h1>' +
        '<p>' + e(instructions(choice.test!, choice.mode!)) + '</p>' +
        '<p class="muted">Afterwards, enter your result here or from Home, and your plan is built.</p>' +
        '<div class="next-workout__actions">' +
            '<a href="timer/plan-test" class="btn btn--primary btn--large">Start the test</a>' +
            '<a href="guide/result" class="btn btn--large">Enter result</a>' +
            back +
        '</div>';

    const renderResult = (plan: Plan | null) => {
        if (!plan) {
            return '<h1 class="guide__title">No test to enter yet</h1>' +
                '<p class="muted">Start a guided plan to take your first test.</p>' +
                '<a href="guide" class="btn btn--primary btn--large">Guided plan</a>';
        }
        const ramp = plan.test === 'ramp',
            test = guided.tests[plan.test!];
        return '<p class="eyebrow">' + e(test.name) + '</p>' +
            '<h1 class="guide__title">How did it go?</h1>' +
            '<form class="guide__form">' +
                '<div class="field">' +
                    '<label class="block-label" for="guide-steps">' +
                        e(ramp ? 'Steps you finished' : 'Step where talking got hard') + '</label>' +
                    '<input type="number" inputmode="numeric" id="guide-steps" class="input" required min="0" max="' +
                        test.steps + '">' +
                '</div>' +
                (measured(plan.mode) ? '<div class="field">' +
                    '<label class="block-label" for="guide-value">' +
                        e('Your ' + nameOf(plan.mode) + (ramp ? ' over the last full step' : ' when talking got hard')) + '</label>' +
                    '<div class="effort-numeric">' +
                        '<input type="number" inputmode="numeric" id="guide-value" class="input" required min="1" max="' +
                            (effort.mode(plan.mode) as NumericMode).max + '">' +
                        '<span class="effort-numeric__unit">' + e(unitOf(plan.mode)) + '</span>' +
                    '</div>' +
                '</div>' : '') +
                (plan.sessionsPerWeek ? '' : sessionsField) +
                '<button type="submit" class="btn btn--primary btn--large">' +
                    e(plan.sessionsPerWeek ? 'Save result' : 'Build my plan') + '</button>' +
            '</form>';
    };

    const renderDone = (plan: Plan) => {
        const first = plan.block === 1;
        return '<p class="eyebrow">Guided plan</p>' +
            '<h1 class="guide__title">' + e(first ? 'Your plan is ready' : 'Block ' + plan.block + ' is ready') + '</h1>' +
            '<p>' + e(plan.sessionsPerWeek + ' sessions a week, in 4-week blocks at level ' + plan.level + '. ' +
                'Do them in order, with a rest day after the hard ones. ' +
                (plan.test ? 'The last week eases off into your next test.' : 'The last week is a rest week, then the next block steps up a level.')) + '</p>' +
            (measured(plan.mode) ? '<p class="muted">Your targets are now set from your test, and shown in ' +
                e(unitOf(plan.mode)) + '.</p>' : '') +
            '<a href="./" class="btn btn--primary btn--large">See your plan</a>';
    };

    const render = () => {
        body.innerHTML = {metric: renderMetric, sessions: renderSessions, test: renderTest, ready: renderReady}[step]();
    };

    const go = (to: Step) => {
        step = to;
        render();
        window.scrollTo(0, 0);
    };

    // the plan is saved before the test, so Home can offer to enter its result.
    const ready = async () => {
        await planStore.save(guided.create(choice.mode!, choice.test!));
        go('ready');
    };

    const clicked = (event: Event) => {
        const target = (event.target as Element).closest('[data-mode], [data-test], [data-back]');
        if (!target) {
            return;
        }
        if (target.hasAttribute('data-mode')) {
            choice.mode = target.getAttribute('data-mode')!;
            go(measured(choice.mode) ? 'test' : 'sessions');
        } else if (target.hasAttribute('data-test')) {
            choice.test = target.getAttribute('data-test') as TestId;
            ready().catch((error) => reportError('Could not save your plan. ' + error));
        } else {
            go(step === 'ready' ? 'test' : 'metric');
        }
    };

    // by feel, targets show as effort out of 10 whatever the rider showed them in before.
    const startByFeel = async (sessions: HTMLSelectElement) => {
        const plan = guided.create(choice.mode!, null, parseInt(sessions.value, 10)),
            prefs = await preferenceStore.get();
        await Promise.all([planStore.save(plan), preferenceStore.save({...prefs, timerMode: plan.mode})]);
        body.innerHTML = renderDone(plan);
    };

    const submitted = async (event: Event) => {
        event.preventDefault();
        const form = event.target as HTMLFormElement,
            value = form.querySelector<HTMLInputElement>('#guide-value'),
            // only asked when the plan doesn't know it yet.
            sessions = form.querySelector<HTMLSelectElement>('#guide-sessions')!;
        if (step === 'sessions') {
            return startByFeel(sessions);
        }
        const [plan, prefs] = await Promise.all([planStore.get(), preferenceStore.get()]);
        const result = guided.applyResult(
            // the form is only offered with a plan.
            {...plan!, sessionsPerWeek: plan!.sessionsPerWeek || parseInt(sessions.value, 10)},
            prefs,
            {steps: parseInt(form.querySelector<HTMLInputElement>('#guide-steps')!.value, 10), value: value ? parseInt(value.value, 10) : null},
            new Date().toISOString().slice(0, 10));
        await Promise.all([planStore.save(result.plan), preferenceStore.save(result.prefs)]);
        body.innerHTML = renderDone(result.plan);
    };

    const submit = (event: Event) => {
        submitted(event).catch((error) => reportError('Could not save your result. ' + error));
    };

    const teardown = () => {
        el.style.display = '';
        el.removeEventListener('click', clicked);
        el.removeEventListener('submit', submit);
    };

    const setup = async () => {
        body = el.querySelector<HTMLElement>('.guide__body')!;
        step = 'metric';
        choice = {};
        if (router.parameters()[1] === 'result') {
            body.innerHTML = renderResult(await planStore.get());
        } else {
            render();
        }
        el.addEventListener('click', clicked);
        el.addEventListener('submit', submit);
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
