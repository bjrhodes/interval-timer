window.mml = window.mml || {};
mml.utilities = mml.utilities || {};

mml.utilities.ErrorReporter = () => {

    return {
        reporter: (message) => {
            console.log(message);
        }
    };
};
