import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hashed } from '../../../js/src/routers/hashed.js';
import { routes } from './routes.js';

describe('Hashed router', () => {
    let fakeWindow, router, transition;

    const navigate = (hash) => {
        fakeWindow.location.hash = hash;
        fakeWindow.onhashchange();
    };

    beforeEach(() => {
        fakeWindow = { location: { hash: '' } };
        router = Hashed(fakeWindow, routes());
        transition = vi.fn();
    });

    it('transitions to the current hash on init', () => {
        fakeWindow.location.hash = '#timer/threshold-ladder';
        router.init(transition);

        expect(transition).toHaveBeenCalledOnce();
        expect(transition.mock.calls[0][0].id).toBe('timer');
    });

    it('transitions when the hash changes, passing the route being left', () => {
        router.init(transition);
        navigate('#editworkout/threshold-ladder');

        const [to, from] = transition.mock.calls[1];
        expect(to.id).toBe('edit-workout');
        expect(from.id).toBe('workouts');
    });

    it('transitions between two paths on the same route', () => {
        router.init(transition);
        navigate('#timer/threshold-ladder');
        navigate('#timer/climbing-repeats');

        expect(transition).toHaveBeenCalledTimes(3);
        expect(transition.mock.calls[2][0].id).toBe('timer');
        expect(router.parameters()).toEqual(['timer', 'climbing-repeats']);
    });

    it('routes by setting the hash', () => {
        router.route('timer/threshold-ladder');
        expect(fakeWindow.location.hash).toBe('#timer/threshold-ladder');
    });
});
