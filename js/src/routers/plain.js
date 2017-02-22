var mml = mml || {};
mml.routers = mml.routers || {};

/**
 * @todo need to set a listener on the location change or something.
 *
 * Been so long, I don't remember...
 */
mml.routers.Plain = function(window, knownRoutes) {
    'use strict';
    var current,
        transitionTo,
        matcher = mml.routers.Matcher(knownRoutes);

    var route = function(to) {
        var route = matcher.findRoute(to.id, current.id);
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
        route: route,
        parameters: function() {
            return matcher.parameters();
        }
    };
};
