/**
 * Builds links to routes, prefixed with the folder the app is deployed in,
 * e.g. "/" locally or "/interval-timer/" on GitHub Pages.
 */
export const Url = (window, basePath) => {
    // strip any file name (e.g. index.html) so we're left with the folder.
    basePath = basePath || window.location.pathname.replace(/[^\/]*$/, '');

    const route = (to) => {
        return basePath + '#' + (to || '');
    };

    // point any <a data-route="..."> at its route.
    const bindLinks = (root) => {
        const links = (root || window.document).querySelectorAll('a[data-route]');
        Array.prototype.forEach.call(links, (link) => {
            link.setAttribute('href', route(link.getAttribute('data-route')));
        });
    };

    return {
        route: route,
        bindLinks: bindLinks,
        basePath: () => basePath
    };
};
