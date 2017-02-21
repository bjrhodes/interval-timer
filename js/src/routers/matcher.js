var mml = mml || {};
mml.routers = mml.routers || {};

mml.routers.Matcher = function(knownRoutes) {
    'use strict';

    return function(requestedRoute, currentId) {
        var route = knownRoutes.searchBy('hash', requestedRoute);
        if (route && route.id !== currentId) {
            return route;
        }
        return false;
    };
};
