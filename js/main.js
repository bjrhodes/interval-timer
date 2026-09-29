import { Factory } from './src/Factory.js';
import { enumerable } from './src/utilities/enumerable.js';

const basePathMeta = document.querySelector('meta[name="base-path"]'),
    config = {
        basePath: basePathMeta ? basePathMeta.getAttribute("content") : "",
        routes: enumerable([
            {
                hash: "",
                view: "workouts",
                id: "workouts",
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
                description: "Edit workout",
            },
        ]),
    },
    state = { workouts: document.getElementById("workouts") },
    factory = Factory(config, state);

factory.controller().run();
