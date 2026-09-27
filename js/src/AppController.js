export const AppController = (factory) => {
    let view;
    const router = factory.router();

    const transition = (to) => {
        if (view) {
            view.teardown();
        }
        view = factory.view(to);
        view.setup();
    };

    return {
        run: () => {
            factory.url().bindLinks();
            router.init(transition);
        }
    };
};
