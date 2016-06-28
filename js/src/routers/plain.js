var mml = mml || {};
mml.routers = mml.routers || {};

mml.routers.Plain = function(window, knownRoutes) {
    'use strict';
    var current, transitionTo;

    var route = function(to) {
        var route = knownRoutes.searchBy('hash', to);
        if (route) {
            transitionTo(route.id, current);
            current = route.id;
        }
    };

    return {
        init: function(transition) {
            transitionTo = transition;
            route('');
        },
        route: route
    };
};
