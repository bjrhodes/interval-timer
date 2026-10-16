import type { Factory } from './Factory.ts';
import type { Route, View } from './types.ts';

export const AppController = (factory: Factory) => {
    let view: View | undefined,
        transitions = Promise.resolve();
    const router = factory.router(),
        document = factory.document(),
        reportError = factory.errorReporter();

    // lets the stylesheet lay out the shell per view, e.g. hiding the nav behind the timer.
    const renderShell = (to: Route) => {
        document.body.setAttribute('data-view', to.view);
        Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), (link) => {
            if (link.getAttribute('data-nav') === to.nav) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const swap = async (to: Route) => {
        if (view) {
            view.teardown();
        }
        renderShell(to);
        view = factory.view(to);
        await view.setup();
        window.scrollTo(0, 0);
    };

    // views load their data asynchronously, so each transition waits for the last, stopping a slow setup from
    // finishing after the next view has already taken over.
    const transition = (to: Route) => {
        transitions = transitions.then(() => swap(to)).catch((error) => {
            reportError('Could not show the ' + to.view + ' view. ' + error);
        });
    };

    return {
        run: () => {
            router.init(transition);
        }
    };
};
