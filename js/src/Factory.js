import { AppController } from './AppController.js';
import { Hashed } from './routers/hashed.js';
import { Plain } from './routers/plain.js';
import { Url } from './routers/url.js';
import { workout } from './stores/workout-store.js';
import { session } from './timer/session.js';
import { Beep } from './utilities/beep.js';
import { Classy } from './utilities/classy.js';
import { effort } from './utilities/effort.js';
import { enumerable as makeEnumerable } from './utilities/enumerable.js';
import { ErrorReporter } from './utilities/ErrorReporter.js';
import { format as makeFormat } from './utilities/format.js';
import { tools } from './utilities/tools.js';
import { editWorkout } from './views/editworkout.js';
import { timer } from './views/timer.js';
import { workouts } from './views/workouts.js';

// routes and stores refer to these by name.
const views = { editWorkout, timer, workouts };
const stores = { workout };

export const Factory = (config, state, document) => {
    const cached = {
        views : {},
        stores : {}
    };

    // allow this to be injected for mocking purposes.
    document = document || window.document;

    const beep      = Beep();
    const classy    = Classy(document);
    const errorReporter = ErrorReporter(window);
    const format    = makeFormat(window);
    const url       = Url(window, config.basePath);

    // just hate this clunky syntax...
    const getEl = (id) => {
        return document.getElementById(id);
    };

    const router = () => {
        if (!cached.router) {
            if ('onhashchange' in document.body) {
                cached.router = Hashed(window, config.routes);
            } else {
                cached.router = Plain(window, config.routes);
            }
        }

        return cached.router;
    };

    const view = (route) => {
        return views[route.view](getEl(route.id), state, errorReporter.reporter, self);
    };

    // one instance per store, so every view sees the same data.
    const store = (storeName) => {
        if (!cached.stores[storeName]) {
            cached.stores[storeName] = stores[storeName](state, self);
        }

        return cached.stores[storeName];
    };

    const enumerable = (arr) => {
        return makeEnumerable(arr);
    };

    const controller = () => {
        return AppController(self);
    };

    const self = {
        view:       view,
        controller: controller,
        router:     router,
        store:      store,
        enumerable: enumerable,
        classy:     () => classy,
        session:    () => session,
        beep:       () => beep,
        effort:     () => effort,
        format:     () => format,
        tools:      () => tools,
        url:        () => url,
    };

    // need to wrangle this a little so we can inject self into builders.
    return self;
};
