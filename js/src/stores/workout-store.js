var mml = mml || {};
mml.stores = mml.stores || {};

mml.stores.workout = function(state, factory) {
    var workouts,
        tools = factory.tools();

    function fetchWorkouts() {
        return [
            {
                "id": "over-unders-3-2-3-2",
                "title": "Over Unders (3/2/3/2)",
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
                "id": "over-unders-4-2-4",
                "title": "Over Unders (4/2/4)",
                "intervals": [
                    {action: "Warmup", time: 14, unit: "minutes"},
                    {action: "GET READY! (1 of 4) Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},

                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 4, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 4, unit: "minutes"},
                    {action: "Recover (2/4 Next)", time: 4, unit: "minutes"},

                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 4, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 4, unit: "minutes"},
                    {action: "Recover (3/4 Next)", time: 4, unit: "minutes"},

                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 4, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 4, unit: "minutes"},
                    {action: "Recover (4/4 Next)", time: 4, unit: "minutes"},

                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 4, unit: "minutes"},
                    {action: "Climbing Repeat (90 rpm, HR 164 - 167)", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 4, unit: "minutes"},

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
                "id": "descending-intervals",
                "title": "Descending Intervals",
                "intervals" : [
                    {action: "Get set...", time: 1, unit: "minutes"},

                    {action: "Warmup", time: 14, unit: "minutes"},

                    {action: "GET READY! Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},

                    {action: "MAX EFFORT (HR 180)", time: 90, unit: "seconds"},
                    {action: "Recover", time: 90, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 75, unit: "seconds"},
                    {action: "Recover", time: 75, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 60, unit: "seconds"},
                    {action: "Recover", time: 60, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 45, unit: "seconds"},
                    {action: "Recover", time: 45, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover (1 of 3 down)", time: 5, unit: "minutes"},

                    {action: "MAX EFFORT (HR 180)", time: 90, unit: "seconds"},
                    {action: "Recover", time: 90, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 75, unit: "seconds"},
                    {action: "Recover", time: 75, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 60, unit: "seconds"},
                    {action: "Recover", time: 60, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 45, unit: "seconds"},
                    {action: "Recover", time: 45, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover (2 of 3 down)", time: 5, unit: "minutes"},

                    {action: "MAX EFFORT (HR 180)", time: 90, unit: "seconds"},
                    {action: "Recover", time: 90, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 75, unit: "seconds"},
                    {action: "Recover", time: 75, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 60, unit: "seconds"},
                    {action: "Recover", time: 60, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 45, unit: "seconds"},
                    {action: "Recover", time: 45, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 30, unit: "seconds"},
                    {action: "Recover", time: 30, unit: "seconds"},
                    {action: "MAX EFFORT (HR 180)", time: 15, unit: "seconds"},

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

                    {action: "cooldown ", time: 15, unit: "minutes"},
                ]
            },
            {
                "id": "threshold-ladder-tempo",
                "title": "Threshold Ladder Tempo",
                "intervals": [

                    {action: "Warmup", time: 14, unit: "minutes"},

                    {action: "GET READY! Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},

                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "Tempo (70/75 RPM, HR 152-156)", time: 8, unit: "minutes"},
                    {action: "Recover 1/3 done", time: 5, unit: "minutes"},

                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "Tempo (70/75 RPM, HR 152-156)", time: 8, unit: "minutes"},
                    {action: "Recover 2/3 done", time: 5, unit: "minutes"},

                    {action: "Climbing Repeat (90 rpm, HR 164 - 167) ", time: 2, unit: "minutes"},
                    {action: "Steady State (90 rpm, HR 159 - 162)", time: 5, unit: "minutes"},
                    {action: "Tempo (70/75 RPM, HR 152-156)", time: 8, unit: "minutes"},

                    {action: "cooldown ", time: 20, unit: "minutes"},
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
                "id": "power-intervals-2",
                "title": "Power intervals (2 min)",
                "intervals": [

                    {action: "Warmup", time: 15, unit: "minutes"},

                    {action: "PREPARE: Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "PREPARE: Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "PREPARE: Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "PREPARE: Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "PREPARE: Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "PREPARE: Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "PREPARE: Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},
                    {action: "Recover", time: 2, unit: "minutes"},
                    {action: "PREPARE: Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 2, unit: "minutes"},

                    {action: "cooldown ", time: 10, unit: "minutes"},
                ]
            },
            {
                "id": "power-intervals-1",
                "title": "Power intervals (1 min)",
                "intervals": [

                    {action: "spin up", time: 60, unit: "seconds"},
                    {action: "Warmup", time: 15, unit: "minutes"},

                    {action: "PREPARE (1/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (2/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (3/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (4/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (5/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (6/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (7/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (8/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (9/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (10/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (11/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},
                    {action: "Recover", time: 1, unit: "minutes"},

                    {action: "PREPARE (12/12): Build to 100+ rpm, HR 173", time: 1, unit: "minutes"},
                    {action: "Power interval (100+ rpm, HR 173 to 180) ", time: 1, unit: "minutes"},

                    {action: "cooldown ", time: 10, unit: "minutes"},
                ]
            },
            {
                "id": "speed-intervals-30",
                "title": "Speed intervals (30s)",
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
            {
                "id": "speed-intervals-15",
                "title": "Speed intervals (15s)",
                "intervals": [

                    {action: "Warmup", time: 14, unit: "minutes"},

                    {action: "GET READY! Bring RPM to 90, HR to 159", time: 60, unit: "seconds"},

                    {action: "MAX EFFORT 1/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 2/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 3/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 4/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 5/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 6/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 7/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 8/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 9/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 10/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 11/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 12/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 13/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 14/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 15/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 16/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 17/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 18/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 19/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 20/20 (HR 180)", time: 15, unit: "seconds"},

                    {action: "Recover - 2 sets to go!", time: 5, unit: "minutes"},

                    {action: "MAX EFFORT 1/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 2/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 3/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 4/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 5/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 6/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 7/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 8/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 9/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 10/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 11/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 12/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 13/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 14/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 15/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 16/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 17/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 18/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 19/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 20/20 (HR 180)", time: 15, unit: "seconds"},

                    {action: "Recover - 1 set to go!", time: 5, unit: "minutes"},

                    {action: "MAX EFFORT 1/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 2/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 3/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 4/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 5/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 6/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 7/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 8/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 9/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 10/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 11/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 12/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 13/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 14/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 15/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 16/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 17/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 18/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 19/20 (HR 180)", time: 15, unit: "seconds"},
                    {action: "Recover", time: 15, unit: "seconds"},
                    {action: "MAX EFFORT 20/20 (HR 180)", time: 15, unit: "seconds"},

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
