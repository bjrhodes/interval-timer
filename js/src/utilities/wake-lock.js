/**
 * Keeps the screen on while something wants it on. Browsers drop the lock whenever the page is hidden, so it is
 * taken again when the page comes back. Where the Screen Wake Lock API is missing, or refuses, this does nothing.
 */
export const WakeLock = (window) => {
    const api = window.navigator && window.navigator.wakeLock;
    let wanted = false,
        sentinel = null,
        pending = null;

    const noop = () => {};

    const request = () => {
        if (!api || !wanted || sentinel || pending || window.document.visibilityState !== 'visible') {
            return;
        }
        pending = api.request('screen').then((lock) => {
            pending = null;
            // released while the request was in flight.
            if (!wanted) {
                lock.release().catch(noop);
                return;
            }
            sentinel = lock;
            lock.addEventListener('release', () => {
                sentinel = sentinel === lock ? null : sentinel;
            });
        }).catch(() => {
            pending = null;
        });
    };

    const acquire = () => {
        wanted = true;
        request();
    };

    const release = () => {
        wanted = false;
        if (sentinel) {
            const lock = sentinel;
            sentinel = null;
            lock.release().catch(noop);
        }
    };

    if (api) {
        window.document.addEventListener('visibilitychange', request);
    }

    return {
        acquire: acquire,
        release: release,
    };
};
