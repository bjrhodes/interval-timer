export const Matcher = (knownRoutes) => {
    /*
     * This is probably going to bite me in the ass, and should maybe be docs instead.
     *
     * If you provide an empty string as the first route, no other routes work, so we sort them to the end.
     *
     * Prevents fall through routing though, so your routes must be regex-ily unique.
     */
    const routes = knownRoutes.sortBy('path').reverse();

    const findRoute = (requestedRoute) => {
        return routes.searchRegexBy('path', requestedRoute);
    };

    const parameters = (str) => {
        return typeof(str) === 'string'  ? str.split('/') : [];
    };

    return {
        findRoute: findRoute,
        parameters: parameters
    };
};
