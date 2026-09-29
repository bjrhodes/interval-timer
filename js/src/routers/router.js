import { Matcher } from './matcher.js';

/**
 * Routes on the path below the page's <base href>, e.g. "timer/threshold-ladder" at "/interval-timer/timer/threshold-ladder".
 */
export const Router = (window, knownRoutes) => {
    let current = '';
    const matcher = Matcher(knownRoutes),
        base = new URL(window.document.baseURI).pathname;

    const path = () => {
        const pathname = window.location.pathname;
        return pathname.startsWith(base) ? pathname.slice(base.length) : '';
    };

    // follow plain left clicks on links inside the app, leaving new tabs, downloads and other sites to the browser.
    const isAppLink = (event, link) => {
        return link && !event.defaultPrevented && event.button === 0 &&
            !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) &&
            !link.target && !link.hasAttribute('download') &&
            link.origin === window.location.origin && link.pathname.startsWith(base);
    };

    return {
        init: (transitionTo) => {
            const changed = () => {
                const route = matcher.findRoute(path());
                if (route) {
                    transitionTo(route, current);
                    current = route;
                }
            };

            window.document.addEventListener('click', (event) => {
                const link = event.target.closest('a[href]');
                if (isAppLink(event, link)) {
                    event.preventDefault();
                    window.history.pushState(null, '', link.href);
                    changed();
                }
            });
            window.addEventListener('popstate', changed);
            changed();
        },
        parameters: () => {
            return matcher.parameters(path());
        }
    };
};
