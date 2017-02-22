var mml = mml || {};
mml.routers = mml.routers || {};

mml.routers.Hashed = function(window, knownRoutes) {
    'use strict';
    var current = '';
    var transitionTo,
        matcher = mml.routers.Matcher(knownRoutes);

    var hashChanged = function() {
        var hash = window.location.hash.substr(1);
        var route = matcher.findRoute(hash, current.id);
        if (route) {
            transitionTo(route, current);
            current = route;
        }
    };

    window.onhashchange = hashChanged;

    return {
        init: function(transition) {
            transitionTo = transition;
            hashChanged();
        },
        route: function(to) {
            window.location.hash = '#' + to;
        },
        parameters: function() {
            return matcher.parameters(window.location.hash.substr(1));
        }
    };
};
