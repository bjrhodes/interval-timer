import { Factory } from './src/Factory.js';
import { enumerable } from './src/utilities/enumerable.js';

const basePathMeta = document.querySelector('meta[name="base-path"]'),
    config = {
        basePath: basePathMeta ? basePathMeta.getAttribute("content") : "",
        // `nav` is the main nav item to highlight; the timer has none, as it hides the nav to stay distraction free.
        routes: enumerable([
            {
                hash: "",
                view: "home",
                id: "home",
                nav: "home",
                description: "Next workout and stats",
            },
            {
                hash: /^workouts$/,
                view: "workouts",
                id: "workouts",
                nav: "workouts",
                description: "View all workouts",
            },
            {
                hash: /^timer(\/.*)?/,
                view: "timer",
                id: "timer",
                description: "The workout timer",
            },
            {
                hash: "^editworkout(/.*)?",
                view: "editWorkout",
                id: "edit-workout",
                nav: "workouts",
                description: "Edit workout",
            },
        ]),
    },
    state = { workouts: document.getElementById("workouts") },
    factory = Factory(config, state);

factory.controller().run();
