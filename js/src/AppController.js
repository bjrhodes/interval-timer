export const AppController = (factory) => {
    let view,
        transitions = Promise.resolve();
    const router = factory.router(),
        document = factory.document(),
        reportError = factory.errorReporter();

    // lets the stylesheet lay out the shell per view, e.g. hiding the nav behind the timer.
    const renderShell = (to) => {
        document.body.setAttribute('data-view', to.view);
        Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), (link) => {
            if (link.getAttribute('data-nav') === to.nav) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const swap = async (to) => {
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
    const transition = (to) => {
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
