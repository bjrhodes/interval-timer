import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { Router, type Transition } from '../../../src/routers/router.ts';
import type { Route } from '../../../src/types.ts';
import { routes } from './routes.ts';

describe('Router', () => {
    const notFound: Route = { path: '', view: 'notFound', id: 'not-found' };
    let router: ReturnType<typeof Router>, transition: Mock<Transition>, links: HTMLElement;

    const link = (href: string, attributes: Record<string, string> = {}) => {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        Object.entries(attributes).forEach(([name, value]) => a.setAttribute(name, value));
        links.appendChild(a);
        return a;
    };

    // reports whether the router took the click, then stops jsdom trying to follow it.
    const click = (el: HTMLElement, init: MouseEventInit = {}) => {
        let handled: boolean | undefined;
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
        links = document.getElementById('links')!;
        window.history.replaceState(null, '', '/app/');
        router = Router(window, routes(), notFound);
        transition = vi.fn<Transition>();
    });

    // each test's router listens on the shared document and window, so stop it hearing the next test.
    afterEach(() => {
        [document, window].forEach((target: EventTarget) => {
            vi.mocked(target.addEventListener).mock.calls.forEach((args) => target.removeEventListener(...args));
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

    it('transitions to the not found route for an unknown path', () => {
        window.history.replaceState(null, '', '/app/not-a-real-page');
        router.init(transition);

        expect(transition.mock.calls[0][0]).toBe(notFound);
    });

    it('follows links in the app, passing the route being left', () => {
        router.init(transition);
        expect(click(link('editworkout/threshold-ladder'))).toBe(true);

        expect(window.location.pathname).toBe('/app/editworkout/threshold-ladder');
        const [to, from] = transition.mock.calls[1];
        expect(to.id).toBe('edit-workout');
        expect((from as Route).id).toBe('workouts');
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
        window.history.replaceState(null, '', '/app/timer/threshold-ladder');
        window.dispatchEvent(new PopStateEvent('popstate'));

        expect(transition.mock.calls[1][0].id).toBe('timer');
    });

    it('replaces the current page, without adding to the history', () => {
        router.init(transition);
        const length = window.history.length;
        router.replace('timer/threshold-ladder');

        expect(window.location.pathname).toBe('/app/timer/threshold-ladder');
        expect(window.history.length).toBe(length);
        const [to, from] = transition.mock.calls[1];
        expect(to.id).toBe('timer');
        expect((from as Route).id).toBe('workouts');
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
