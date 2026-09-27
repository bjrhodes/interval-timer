/* The vaguest name... */
export const tools = {
    clone: (thing) => {
        // @todo add try / catch
        return JSON.parse(JSON.stringify(thing));
    },
    escapeHtml: (str) => {
        const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' };
        return String(str).replace(/[&<>"'\/]/g, (c) => entities[c]);
    }
};
