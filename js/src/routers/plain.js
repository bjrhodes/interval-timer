var mml = mml || {};
mml.routers = mml.routers || {};

mml.routers.Plain = function(window, knownRoutes) {
    'use strict';
    var current,
        transitionTo,
        matcher = mml.routers.Matcher(knownRoutes);

    var route = function(to) {
        var route = matcher(to.id, current.id);
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
