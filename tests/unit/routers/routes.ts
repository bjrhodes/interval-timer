import { enumerable } from '../../../src/utilities/enumerable.ts';
import type { Route } from '../../../src/types.ts';

// the same shape as the routes configured in src/main.ts.
export const routes = () => enumerable<Route>([
    { path: '', view: 'workouts', id: 'workouts' },
    { path: /^timer(\/.*)?/, view: 'timer', id: 'timer' },
    { path: '^editworkout(/.*)?', view: 'editWorkout', id: 'edit-workout' },
]);
