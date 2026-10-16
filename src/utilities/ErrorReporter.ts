import type { Reporter } from '../types.ts';

export const ErrorReporter = (): { reporter: Reporter } => {

    return {
        reporter: (message) => {
            console.log(message);
        }
    };
};
