var mml = mml || {};
mml.routers = mml.routers || {};

mml.routers.Matcher = function(knownRoutes) {
    'use strict';

    /*
     * This is probably going to bite me in the ass, and should maybe be docs instead.
     *
     * If you provide an empty string as the first route, no other routes work, so we sort them to the end.
     *
     * Prevents fall through routing though, so your routes must be regex-ily unique.
     */
    knownRoutes = knownRoutes.sortBy('hash').reverse();

    return function(requestedRoute, currentId) {
        var route = knownRoutes.searchRegexBy('hash', requestedRoute);
        if (route && route.id !== currentId) {
            return route;
        }
        return false;
    };
};
