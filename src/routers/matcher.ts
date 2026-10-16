import type { Route } from '../types.ts';
import type { Enumerable } from '../utilities/enumerable.ts';

export const Matcher = (knownRoutes: Enumerable<Route>) => {
    /*
     * This is probably going to bite me in the ass, and should maybe be docs instead.
     *
     * If you provide an empty string as the first route, no other routes work, so we sort them to the end.
     *
     * Prevents fall through routing though, so your routes must be regex-ily unique.
     */
    // reverse works in place, so the sorted copy keeps its methods.
    const routes = knownRoutes.sortBy('path').reverse() as Enumerable<Route>;

    const findRoute = (requestedRoute: string) => {
        return routes.searchRegexBy('path', requestedRoute);
    };

    const parameters = (str: unknown) => {
        return typeof(str) === 'string'  ? str.split('/') : [];
    };

    return {
        findRoute: findRoute,
        parameters: parameters
    };
};
