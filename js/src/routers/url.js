var mml = mml || {};
mml.routers = mml.routers || {};

/**
 * Builds links to routes, prefixed with the folder the app is deployed in,
 * e.g. "/" locally or "/interval-timer/" on GitHub Pages.
 */
mml.routers.Url = function(window, basePath) {
    'use strict';

    // strip any file name (e.g. index.html) so we're left with the folder.
    basePath = basePath || window.location.pathname.replace(/[^\/]*$/, '');

    function route(to) {
        return basePath + '#' + (to || '');
    }

    // point any <a data-route="..."> at its route.
    function bindLinks(root) {
        var links = (root || window.document).querySelectorAll('a[data-route]');
        Array.prototype.forEach.call(links, function(link) {
            link.setAttribute('href', route(link.getAttribute('data-route')));
        });
    }

    return {
        route: route,
        bindLinks: bindLinks,
        basePath: function() { return basePath; }
    };
};
