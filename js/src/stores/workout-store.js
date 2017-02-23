var mml = mml || {};
mml.stores = mml.stores || {};

mml.stores.workout = function(state, factory) {
    var workouts,
        tools = factory.tools();

    function fetchWorkouts() {
        return [
            {
                "id": "over-unders",
                "title": "Over Unders",
                "intervals": [
                    {action: "Warmup", time: 14, unit: "minutes"},
                    {action: "GET READY! Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 3, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 3, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 3, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 3, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 3, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 3, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 3, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 3, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},
                    {action: "cooldown ", time: 10, unit: "minutes"},
                ]
            },
            {
                "id": "steady-state-w-burst",
                "title": "Steady State (SS) w/ burst",
                "intervals" : [
                    {action: "Warmup", time: 14, unit: "minutes"},

                    {action: "GET READY! Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},

                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Recover", time: 5, unit: "minutes"},

                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Recover", time: 5, unit: "minutes"},

                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Recover", time: 5, unit: "minutes"},

                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "STAND UP! MAX EFFORT (HR 180)", time: 10, unit: "seconds"},

                    {action: "cooldown ", time: 10, unit: "minutes"},
                ]
            },
            {
                "id": "threshold-ladder",
                "title": "Threshold Ladder",
                "intervals": [

                    {action: "Warmup", time: 14, unit: "minutes"},

                    {action: "GET READY! Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},

                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},

                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},

                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},

                    {action: "cooldown ", time: 10, unit: "minutes"},
                ]
            },
            {
                "id": "climbing-repeats",
                "title": "Climbing Repeats",
                "intervals": [

                    {action: "Warmup", time: 14, unit: "minutes"},

                    {action: "GET READY! Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},

                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 6, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 6, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 6, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 6, unit: "minutes"},
                    {action: "Recover", time: 4, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 6, unit: "minutes"},

                    {action: "cooldown ", time: 10, unit: "minutes"},
                ]
            },
            {
                "id": "power-intervals",
                "title": "Power intervals",
                "intervals": [

                    {action: "Warmup", time: 14, unit: "minutes"},

                    {action: "GET READY! Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},

                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},

                    {action: "cooldown ", time: 10, unit: "minutes"},
                ]
            },
            {
                "id": "speed-intervals",
                "title": "Speed intervals",
                "intervals": [

                    {action: "Warmup", time: 14, unit: "minutes"},

                    {action: "GET READY! Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},

                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},

                    {action: "Recover", time: 5, unit: "minutes"},

                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},

                    {action: "Recover", time: 5, unit: "minutes"},

                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},

                    {action: "Recover", time: 5, unit: "minutes"},

                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},

                    {action: "cooldown ", time: 10, unit: "minutes"},
                ]
            },
        ];
    };

    workouts = factory.enumerable(fetchWorkouts());

    return {
        getWorkouts: function() {
            return tools.clone(workouts);
        },
        getWorkout: function(id) {
            workout = workouts.searchBy('id', id);
            return tools.clone(workout);
        }
    };
};