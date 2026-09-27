
window.mml = window.mml || {};

mml.Factory = (config, state, document) => {
    'use strict';

    const cached = {
        views : {}
    };

    // allow this to be injected for mocking purposes.
    document = document || window.document;

    const beep      = mml.utilities.Beep();
    const classy    = mml.utilities.Classy(document);
    const countdown = mml.utilities.Countdown();
    const debounce  = mml.utilities.Debounce(window);
    const errorReporter = mml.utilities.ErrorReporter(window);
    const format    = mml.utilities.format(window);
    const tools     = mml.utilities.tools;
    const url       = mml.routers.Url(window, config.basePath);

    // just hate this clunky syntax...
    const getEl = (id) => {
        return document.getElementById(id);
    };

    const router = () => {
        if (!cached.router) {
            if ('onhashchange' in document.body) {
                cached.router = mml.routers.Hashed(window, config.routes);
            } else {
                cached.router = mml.routers.Plain(window, config.routes);
            }
        }

        return cached.router;
    };

    const view = (route) => {
        return mml.views[route.view](getEl(route.id), state, errorReporter.reporter, self);
    };

    const store = (storeName) => {
        return mml.stores[storeName](state, self);
    };

    const enumerable = (arr) => {
        return mml.utilities.enumerable(arr);
    };

    const controller = () => {
        return mml.AppController(self);
    };

    const self = {
        view:       view,
        controller: controller,
        router:     router,
        store:      store,
        enumerable: enumerable,
        classy:     () => classy,
        countdown:  () => countdown,
        beep:       () => beep,
        format:     () => format,
        tools:      () => tools,
        url:        () => url,
    };

    // need to wrangle this a little so we can inject self into builders.
    return self;
};
