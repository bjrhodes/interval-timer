import { Matcher } from './matcher.js';

/**
 * @todo need to set a listener on the location change or something.
 *
 * Been so long, I don't remember...
 */
export const Plain = (window, knownRoutes) => {
    let current,
        transitionTo;
    const matcher = Matcher(knownRoutes);

    const route = (to) => {
        const route = matcher.findRoute(to.id, current.id);
        if (route) {
            transitionTo(route.id, current);
            current = route.id;
        }
    };

    return {
        init: (transition) => {
            transitionTo = transition;
            route('');
        },
        route: route,
        parameters: () => {
            return matcher.parameters();
        }
    };
};
