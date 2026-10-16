import type { ViewBuilder } from '../Factory.ts';

// the page is static markup, so there is nothing to load.
export const notFound: ViewBuilder = (el) => ({
    setup: async () => {
        el.style.display = 'block';
    },
    teardown: () => {
        el.style.display = '';
    },
});
