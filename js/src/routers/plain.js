window.mml = window.mml || {};
mml.routers = mml.routers || {};

/**
 * @todo need to set a listener on the location change or something.
 *
 * Been so long, I don't remember...
 */
mml.routers.Plain = (window, knownRoutes) => {
    'use strict';
    let current,
        transitionTo;
    const matcher = mml.routers.Matcher(knownRoutes);

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
