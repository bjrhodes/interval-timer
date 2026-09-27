/* global mml*/
(() => {
    "use strict";
    const basePathMeta = document.querySelector('meta[name="base-path"]'),
        config = {
            basePath: basePathMeta ? basePathMeta.getAttribute("content") : "",
            routes: mml.utilities.enumerable([
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
                    hash: "^editworkout(\/.*)?",
                    view: "editWorkout",
                    id: "edit-workout",
                    description: "Edit workout",
                },
            ]),
        },
        state = { workouts: document.getElementById("workouts") },
        factory = mml.Factory(config, state);

    factory.controller().run();
})();
