import { beforeEach, describe, expect, it, vi } from 'vitest';
import { guided } from '../../../js/src/plans/guided.js';
import { plan, upgrade } from '../../../js/src/stores/plan-store.js';
import { memoryDb } from '../../../js/src/utilities/idb.js';

const factoryWith = (db, reportError = vi.fn()) => ({
    database: () => db,
    errorReporter: () => reportError,
});

const started = () => guided.applyResult({...guided.create('power', 'ramp'), sessionsPerWeek: 3}, {}, {steps: 10, value: 300}).plan;

describe('plan store', () => {
    let store;

    beforeEach(() => {
        store = plan({}, factoryWith(Promise.resolve(memoryDb({ plan: [] }))));
    });

    it('has no plan until one is started', async () => {
        expect(await store.get()).toBeNull();
        expect(await store.getWorkout('plan-test')).toBe(false);
    });

    it('waits for a save still in flight before reading', async () => {
        store.save(guided.create('power', 'ramp'));
        expect((await store.get()).mode).toBe('power');
    });

    it('builds a session of the saved plan', async () => {
        await store.save(started());
        expect((await store.getWorkout('plan-b1-w1-s1')).title).toBe('Block 1, week 1: Threshold');
    });

    it('marks sessions done once each, even when finished together', async () => {
        await store.save(started());
        await Promise.all([store.complete('plan-b1-w1-s1'), store.complete('plan-b1-w1-s2'), store.complete('plan-b1-w1-s1')]);
        expect((await store.get()).completed).toEqual(['plan-b1-w1-s1', 'plan-b1-w1-s2']);
    });

    it('falls back to memory, and says so, when the database will not open', async () => {
        const reportError = vi.fn();
        store = plan({}, factoryWith(Promise.reject(new Error('blocked')), reportError));
        await store.save(started());
        expect((await store.get()).block).toBe(1);
        expect(reportError).toHaveBeenCalledOnce();
    });
});

describe('plan upgrade', () => {
    it('adds the store to databases older than version 3 only', () => {
        [0, 1, 2, 3].forEach((oldVersion) => {
            const db = { createObjectStore: vi.fn() };
            upgrade(db, oldVersion);
            expect(db.createObjectStore).toHaveBeenCalledTimes(oldVersion < 3 ? 1 : 0);
        });
    });
});
