var mml = mml || {};

mml.Factory = function(config, document) {
    'use strict';

    var self, classy, debounce, cached = {
        views : {}
    };

    // allow this to be injected for mocking purposes.
    document = document || window.document;

    classy   = new mml.utilities.classy(document);
    debounce = new mml.utilities.debounce(window);

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

    function view(route) {;
        return new mml.views[route.view](getEl(route.id));
    };

    function controller() {
        return new mml.AppController(self);
    };

    self = {
        view : view,
        controller: controller,
        router : router
    }

    // need to wrangle this a little so we can inject self into builders.
    return self;
}
