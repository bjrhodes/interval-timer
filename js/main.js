import { Factory } from './src/Factory.js';
import { enumerable } from './src/utilities/enumerable.js';

const config = {
    // `nav` is the main nav item to highlight; the timer has none, as it hides the nav to stay distraction free.
    routes: enumerable([
        {
            path: "",
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
    ]),
},
    state = { workouts: document.getElementById("workouts") },
    factory = Factory(config, state);

factory.controller().run();
