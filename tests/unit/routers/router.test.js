import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from '../../../js/src/routers/router.js';
import { routes } from './routes.js';

describe('Router', () => {
    let router, transition, links;

    const link = (href, attributes = {}) => {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        Object.entries(attributes).forEach(([name, value]) => a.setAttribute(name, value));
        links.appendChild(a);
        return a;
    };

    // reports whether the router took the click, then stops jsdom trying to follow it.
    const click = (el, init = {}) => {
        let handled;
        window.addEventListener('click', (event) => {
            handled = event.defaultPrevented;
            event.preventDefault();
        }, { once: true });
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }));
        return handled;
    };

    beforeEach(() => {
        vi.spyOn(document, 'addEventListener');
        vi.spyOn(window, 'addEventListener');
        document.head.innerHTML = '<base href="/app/">';
        document.body.innerHTML = '<div id="links"></div>';
        links = document.getElementById('links');
        window.history.replaceState(null, '', '/app/');
        router = Router(window, routes());
        transition = vi.fn();
    });

    // each test's router listens on the shared document and window, so stop it hearing the next test.
    afterEach(() => {
        [document, window].forEach((target) => {
            target.addEventListener.mock.calls.forEach((args) => target.removeEventListener(...args));
        });
        vi.restoreAllMocks();
    });

    it('transitions to the current path on init', () => {
        window.history.replaceState(null, '', '/app/timer/threshold-ladder');
        router.init(transition);

        expect(transition).toHaveBeenCalledOnce();
        expect(transition.mock.calls[0][0].id).toBe('timer');
        expect(router.parameters()).toEqual(['timer', 'threshold-ladder']);
    });

    it('follows links in the app, passing the route being left', () => {
        router.init(transition);
        expect(click(link('editworkout/threshold-ladder'))).toBe(true);

        expect(window.location.pathname).toBe('/app/editworkout/threshold-ladder');
        const [to, from] = transition.mock.calls[1];
        expect(to.id).toBe('edit-workout');
        expect(from.id).toBe('workouts');
    });

    it('transitions between two paths on the same route', () => {
        router.init(transition);
        click(link('timer/threshold-ladder'));
        click(link('timer/climbing-repeats'));

        expect(transition).toHaveBeenCalledTimes(3);
        expect(transition.mock.calls[2][0].id).toBe('timer');
        expect(router.parameters()).toEqual(['timer', 'climbing-repeats']);
    });

    it('transitions on browser back and forward', () => {
        router.init(transition);
        window.history.replaceState(null, '', '/app/workouts');
        window.dispatchEvent(new PopStateEvent('popstate'));

        expect(transition.mock.calls[1][0].id).toBe('workouts');
    });

    it.each([
        ['a new tab', () => link('timer/x', { target: '_blank' }), {}],
        ['a modified click', () => link('timer/x'), { metaKey: true }],
        ['a download', () => link('timer/x', { download: 'x.json' }), {}],
        ['another site', () => link('https://example.com/app/timer/x'), {}],
        ['a page outside the app', () => link('/elsewhere'), {}],
    ])('leaves %s to the browser', (name, make, init) => {
        router.init(transition);
        expect(click(make(), init)).toBe(false);
        expect(transition).toHaveBeenCalledOnce();
    });

    it('leaves links a view has already handled', () => {
        router.init(transition);
        const a = link('timer/x');
        a.addEventListener('click', (e) => e.preventDefault());
        click(a);

        expect(window.location.pathname).toBe('/app/');
        expect(transition).toHaveBeenCalledOnce();
    });
});
