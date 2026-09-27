var mml = mml || {};
mml.utilities = mml.utilities || {};

/* The vaguest name... */
mml.utilities.tools = {
    clone: function(thing) {
        // @todo add try / catch
        return JSON.parse(JSON.stringify(thing));
    },
    escapeHtml: function(str) {
        var entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' };
        return String(str).replace(/[&<>"'\/]/g, function(c) { return entities[c]; });
    }
};
