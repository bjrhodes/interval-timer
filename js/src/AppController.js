var mml = mml || {};

mml.AppController = function(factory) {
    'use strict';

    var view;
    var router = factory.router();

    function transition(to) {
        if (view) {
            view.teardown();
        }
        view = factory.view(to);
        view.setup();
    }

    return {
        run: function() {
            router.init(transition);
        }
    };
};
