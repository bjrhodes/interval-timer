import { enumerable } from '../../../js/src/utilities/enumerable.js';

// the same shape as the routes configured in js/main.js.
export const routes = () => enumerable([
    { hash: '', view: 'workouts', id: 'workouts' },
    { hash: /^timer(\/.*)?/, view: 'timer', id: 'timer' },
    { hash: '^editworkout(\/.*)?', view: 'editWorkout', id: 'edit-workout' },
]);
