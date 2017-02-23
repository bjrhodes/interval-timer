/* global Mustache */

var mml = mml || {};

mml.Factory = function(config, state, document) {
    'use strict';

    var self, beep, classy, countdown, debounce, format, errorReporter, tools, cached = {
        views : {}
    };

    // allow this to be injected for mocking purposes.
    document = document || window.document;

    beep      = new mml.utilities.Beep();
    classy    = new mml.utilities.Classy(document);
    countdown = new mml.utilities.Countdown();
    debounce  = new mml.utilities.Debounce(window);
    errorReporter = new mml.utilities.ErrorReporter(window);
    format    = new mml.utilities.format(window);
    tools     = mml.utilities.tools;

    // just hate this clunky syntax...
    function getEl(id) {
        return document.getElementById(id);
    };

    function router() {
        if (!cached.router) {
            if ('onhashchange' in document.body) {
                cached.router = new mml.routers.Hashed(window, config.routes);
            } else {
                cached.router = new mml.routers.Plain(window, config.routes);
            }
        }

        return cached.router;
    }

    function view(route) {
        return new mml.views[route.view](getEl(route.id), state, errorReporter.reporter, self);
    };

    function store(storeName) {
        return new mml.stores[storeName](state, self);
    };

    function enumerable(arr) {
        return new mml.utilities.enumerable(arr);
    };

    function controller() {
        return new mml.AppController(self);
    };

    self = {
        view:       view,
        controller: controller,
        router:     router,
        store:      store,
        enumerable: enumerable,
        classy:     function() { return classy; },
        countdown:  function() { return countdown; },
        beep:       function() { return beep; },
        format:     function() { return format; },
        tools:      function() { return tools; },
        mustache:   function() { return Mustache; },
    }

    // need to wrangle this a little so we can inject self into builders.
    return self;
}
