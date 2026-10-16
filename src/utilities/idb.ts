/**
 * A thin promise wrapper over IndexedDB, and the only code that touches it directly.
 *
 * Each call is its own transaction; IndexedDB runs transactions on the same object store in the order they were made,
 * so writes land in the order they were issued.
 */

// every stored record is keyed by its `id`.
export interface Rec {
    id: string;
}

export interface Db {
    getAll: <T extends Rec>(store: string) => Promise<T[]>;
    get: <T extends Rec>(store: string, key: string) => Promise<T | undefined>;
    put: (store: string, value: Rec) => Promise<void>;
    putAll: (store: string, values: Rec[]) => Promise<void>;
    delete: (store: string, key: string) => Promise<void>;
}

export type Upgrade = (db: IDBDatabase, oldVersion: number) => void;

const promised = <T>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

const wrap = (db: IDBDatabase): Db => {
    const read = (store: string, fn: (s: IDBObjectStore) => IDBRequest) => promised(fn(db.transaction(store).objectStore(store)));
    const write = (store: string, fn: (s: IDBObjectStore) => void) => new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        fn(tx.objectStore(store));
        tx.oncomplete = () => resolve();
        tx.onerror = tx.onabort = () => reject(tx.error);
    });

    return {
        getAll: (store) => read(store, (s) => s.getAll()),
        get: (store, key) => read(store, (s) => s.get(key)),
        put: (store, value) => write(store, (s) => s.put(value)),
        putAll: (store, values) => write(store, (s) => values.forEach((value) => s.put(value))),
        delete: (store, key) => write(store, (s) => s.delete(key)),
    };
};

// `upgrade(db, oldVersion)` only runs when the database is new or `version` goes up; it owns the schema and seed data.
export const openDb = (window: Window, name: string, version: number, upgrade: Upgrade) => new Promise<Db>((resolve, reject) => {
    const request = window.indexedDB.open(name, version);
    request.onupgradeneeded = (e) => upgrade(request.result, e.oldVersion);
    promised(request).then((db) => {
        // let a newer version of the app, open in another tab, upgrade the schema.
        db.onversionchange = () => db.close();
        resolve(wrap(db));
    }, reject);
});

// The same interface kept in memory, for when IndexedDB is unavailable. Records are keyed by their `id`.
export const memoryDb = (stores: Record<string, Rec[]>): Db => {
    const maps: Record<string, Map<string, Rec>> = {};
    Object.keys(stores).forEach((name) => {
        maps[name] = new Map(stores[name].map((value) => [value.id, structuredClone(value)]));
    });
    // copies in and out, as IndexedDB does, so callers can't change what is stored by accident.
    const later = <T>(fn: () => T) => Promise.resolve().then(fn);

    return {
        getAll: <T extends Rec>(store: string) => later(() => [...maps[store].values()].map((value) => structuredClone(value) as T)),
        get: <T extends Rec>(store: string, key: string) => later(() => maps[store].has(key) ? structuredClone(maps[store].get(key)) as T : undefined),
        put: (store, value) => later(() => { maps[store].set(value.id, structuredClone(value)); }),
        putAll: (store, values) => later(() => values.forEach((value) => maps[store].set(value.id, structuredClone(value)))),
        delete: (store, key) => later(() => { maps[store].delete(key); }),
    };
};
