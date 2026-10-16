/* The vaguest name... */
const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' };

export const tools = {
    clone: <T>(thing: T): T => {
        // @todo add try / catch
        return JSON.parse(JSON.stringify(thing));
    },
    escapeHtml: (str: unknown) => {
        return String(str).replace(/[&<>"'/]/g, (c) => entities[c]);
    }
};
