var mml = mml || {};
mml.utilities = mml.utilities || {};

/* The vaguest name... */
mml.utilities.tools = {
    clone: function(thing) {
        // @todo add try / catch
        return JSON.parse(JSON.stringify(thing));
    }
};
