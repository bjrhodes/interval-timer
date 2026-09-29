import { enumerable } from '../../../js/src/utilities/enumerable.js';

// the same shape as the routes configured in js/main.js.
export const routes = () => enumerable([
    { path: '', view: 'workouts', id: 'workouts' },
    { path: /^timer(\/.*)?/, view: 'timer', id: 'timer' },
    { path: '^editworkout(/.*)?', view: 'editWorkout', id: 'edit-workout' },
]);
