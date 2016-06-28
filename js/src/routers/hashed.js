var mml = mml || {};
mml.routers = mml.routers || {};

mml.routers.Hashed = function(window, knownRoutes) {
    'use strict';
    var current = '';
    var transitionTo;

    var hashChanged = function() {
        var hash = window.location.hash.substr(1);
        var route = knownRoutes.searchBy('hash', hash);
        if (route && route.id !== current.id) {
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
        }
    };
};
