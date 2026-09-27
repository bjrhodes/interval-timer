window.mml = window.mml || {};
mml.routers = mml.routers || {};

mml.routers.Hashed = (window, knownRoutes) => {
    'use strict';
    let current = '';
    let transitionTo;
    const matcher = mml.routers.Matcher(knownRoutes);

    const hashChanged = () => {
        const hash = window.location.hash.substr(1);
        const route = matcher.findRoute(hash, current.id);
        if (route) {
            transitionTo(route, current);
            current = route;
        }
    };

    window.onhashchange = hashChanged;

    return {
        init: (transition) => {
            transitionTo = transition;
            hashChanged();
        },
        route: (to) => {
            window.location.hash = '#' + to;
        },
        parameters: () => {
            return matcher.parameters(window.location.hash.substr(1));
        }
    };
};
