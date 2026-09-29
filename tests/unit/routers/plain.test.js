import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Plain } from '../../../js/src/routers/plain.js';
import { routes } from './routes.js';

describe('Plain router', () => {
    let router, transition;

    beforeEach(() => {
        router = Plain({}, routes());
        transition = vi.fn();
    });

    it('transitions to the default route on init', () => {
        router.init(transition);

        expect(transition).toHaveBeenCalledOnce();
        expect(transition.mock.calls[0][0].id).toBe('workouts');
    });

    it('transitions to a route, passing the route being left', () => {
        router.init(transition);
        router.route('timer/threshold-ladder');

        const [to, from] = transition.mock.calls[1];
        expect(to.id).toBe('timer');
        expect(from.id).toBe('workouts');
    });

    it('exposes the parameters of the current path', () => {
        router.init(transition);
        expect(router.parameters()).toEqual(['']);

        router.route('timer/threshold-ladder');
        expect(router.parameters()).toEqual(['timer', 'threshold-ladder']);
    });
});
