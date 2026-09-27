export const editWorkout = (el) => {
    const teardown = () => {
        el.style.display = '';
    };
    const setup = () => {
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
