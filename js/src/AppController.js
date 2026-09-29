export const AppController = (factory) => {
    let view;
    const router = factory.router(),
        document = factory.document();

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

    const transition = (to) => {
        if (view) {
            view.teardown();
        }
        renderShell(to);
        view = factory.view(to);
        view.setup();
        window.scrollTo(0, 0);
    };

    return {
        run: () => {
            factory.url().bindLinks();
            router.init(transition);
        }
    };
};
