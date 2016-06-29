var mml = mml ||{};
mml.utilities = mml.utilities || {};

mml.utilities.ErrorReporter = function() {

    return {
        reporter: function(message) {
            console.log(message);
        }
    }
};
