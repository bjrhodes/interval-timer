/**
 * This slows firing to at most once every interval.
 *
 */
export const Debounce = (window: Window) => {
    const running: unknown[] = [];

    return (fn: () => void, time: number, identifier: unknown) => {
        const findTimer = (id: unknown) => {
            return (id === identifier);
        };
        const removeTimer = (id: unknown, index: number) => {
            if (id === identifier) {
                running.splice(index, 1);
                return true;
            }
            return false;
        };
        const runAndClear = () => {
            fn();
            running.some(removeTimer);
        };

        if (running.some(findTimer)) {
            return; // if a timer is already set, let it run
        }

        running.push(identifier);
        window.setTimeout(runAndClear, time);
    };
};
