import { Matcher } from './matcher.js';

/**
 * @todo need to set a listener on the location change or something.
 *
 * Been so long, I don't remember...
 */
export const Plain = (window, knownRoutes) => {
    let current,
        currentPath = '',
        transitionTo;
    const matcher = Matcher(knownRoutes);

    const route = (to) => {
        const found = matcher.findRoute(to);
        if (found) {
            transitionTo(found, current);
            current = found;
            currentPath = to;
        }
    };

    return {
        init: (transition) => {
            transitionTo = transition;
            route('');
        },
        route: route,
        parameters: () => {
            return matcher.parameters(currentPath);
        }
    };
};
