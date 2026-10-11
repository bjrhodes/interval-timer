/**
 * Reloads into a newly deployed version when the page comes back into view. Phones restore a tab from memory without
 * asking the server, so they would otherwise keep running the old version. The deploy stamps the version into the
 * page and into version.txt; locally the stamp is empty, so this does nothing.
 */
export const UpdateCheck = (window, isBusy) => {
    const meta = window.document.querySelector('meta[name="app-version"]'),
        version = meta && meta.getAttribute('content');

    if (!version) {
        return;
    }

    window.document.addEventListener('visibilitychange', () => {
        if (window.document.visibilityState !== 'visible' || isBusy()) {
            return;
        }
        // no-store skips the HTTP cache, which would otherwise hold the old version for a while.
        window.fetch('version.txt', { cache: 'no-store' })
            .then((response) => response.ok ? response.text() : version)
            .then((latest) => {
                if (latest.trim() !== version && !isBusy()) {
                    window.location.reload();
                }
            })
            // offline, or mid-deploy: try again next time.
            .catch(() => {});
    });
};
