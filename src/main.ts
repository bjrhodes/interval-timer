import { Factory } from './Factory.ts';
import { enumerable } from './utilities/enumerable.ts';
import type { Route } from './types.ts';

const config = {
    // `nav` is the main nav item to highlight; the timer has none, as it hides the nav to stay distraction free.
    routes: enumerable<Route>([
        {
            // the bare base path, or index.html when a server or bookmark names it.
            path: /^(index\.html)?$/,
            view: "home",
            id: "home",
            nav: "home",
            description: "Next workout and stats",
        },
        {
            path: /^workouts$/,
            view: "workouts",
            id: "workouts",
            nav: "workouts",
            description: "View all workouts",
        },
        {
            path: /^timer(\/.*)?/,
            view: "timer",
            id: "timer",
            description: "The workout timer",
        },
        {
            path: "^editworkout(/.*)?",
            view: "editWorkout",
            id: "edit-workout",
            nav: "workouts",
            description: "Edit workout",
        },
        {
            path: /^guide(\/.*)?/,
            view: "guide",
            id: "guide",
            nav: "home",
            description: "Set up a guided plan",
        },
        {
            path: /^preferences$/,
            view: "preferences",
            id: "preferences",
            nav: "preferences",
            description: "Effort conversions",
        },
    ]),
    notFound: {
        path: "",
        view: "notFound",
        id: "not-found",
        description: "Page not found",
    } satisfies Route,
},
    state = { workouts: document.getElementById("workouts") },
    factory = Factory(config, state);

factory.controller().run();
