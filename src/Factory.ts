import { AppController } from './AppController.ts';
import { guided } from './plans/guided.ts';
import { Router } from './routers/router.ts';
import { plan, upgrade as upgradePlan } from './stores/plan-store.ts';
import { preferences as preferenceStore, upgrade as upgradePreferences } from './stores/preferences-store.ts';
import { upgrade as upgradeWorkouts, workout } from './stores/workout-store.ts';
import { session } from './timer/session.ts';
import { Beep, sounds } from './utilities/beep.ts';
import { Classy } from './utilities/classy.ts';
import { conversions } from './utilities/conversions.ts';
import { effort } from './utilities/effort.ts';
import { enumerable as makeEnumerable, type Enumerable } from './utilities/enumerable.ts';
import { ErrorReporter } from './utilities/ErrorReporter.ts';
import { format as makeFormat } from './utilities/format.ts';
import { openDb, type Db, type Upgrade } from './utilities/idb.ts';
import { summarise } from './utilities/summary.ts';
import { tools } from './utilities/tools.ts';
import { UpdateCheck } from './utilities/update-check.ts';
import { WakeLock } from './utilities/wake-lock.ts';
import { editWorkout } from './views/editworkout.ts';
import { guide } from './views/guide.ts';
import { home } from './views/home.ts';
import { notFound } from './views/notfound.ts';
import { preferences } from './views/preferences.ts';
import { timer } from './views/timer.ts';
import { workouts } from './views/workouts.ts';
import type { Reporter, Route, State, View, ViewName } from './types.ts';

export type Factory = ReturnType<typeof Factory>;

export type ViewBuilder = (el: HTMLElement, state: State, reportError: Reporter, factory: Factory) => View;

export interface Config {
    routes: Enumerable<Route>;
    // shown for a path no route matches.
    notFound: Route;
}

// routes and stores refer to these by name.
const views: Record<ViewName, ViewBuilder> = { editWorkout, guide, home, notFound, preferences, timer, workouts };
const stores = { workout, preferences: preferenceStore, plan };

type Stores = { [K in keyof typeof stores]: ReturnType<typeof stores[K]> };

const upgrade: Upgrade = (db, oldVersion) => {
    upgradeWorkouts(db, oldVersion);
    upgradePreferences(db, oldVersion);
    upgradePlan(db, oldVersion);
};

export const Factory = (config: Config, state: State, document?: Document) => {
    const cached: { stores: Partial<Stores>, router?: ReturnType<typeof Router>, db?: Promise<Db> } = {
        stores : {}
    };

    // allow this to be injected for mocking purposes.
    const doc = document || window.document;

    const beep      = Beep();
    const classy    = Classy(doc);
    const errorReporter = ErrorReporter();
    const format    = makeFormat();
    const wakeLock  = WakeLock(window);

    // never reload under a running workout, or before an edit has saved.
    UpdateCheck(window, () => ['timer', 'editWorkout', 'preferences', 'guide'].includes(doc.body.getAttribute('data-view') || ''));

    // just hate this clunky syntax...
    const getEl = (id: string) => {
        return doc.getElementById(id)!;
    };

    const router = () => {
        if (!cached.router) {
            cached.router = Router(window, config.routes, config.notFound);
        }

        return cached.router;
    };

    const view = (route: Route): View => {
        return views[route.view](getEl(route.id), state, errorReporter.reporter, self);
    };

    // one instance per store, so every view sees the same data.
    const store = <K extends keyof Stores>(storeName: K): Stores[K] => {
        if (!cached.stores[storeName]) {
            cached.stores[storeName] = stores[storeName](state, self) as Stores[K];
        }

        return cached.stores[storeName]!;
    };

    // one connection, shared by every store.
    const database = (): Promise<Db> => {
        if (!cached.db) {
            cached.db = openDb(window, 'interval-timer', 3, upgrade);
            // asks the browser not to clear storage under pressure, e.g. Safari after a week without a visit.
            window.navigator.storage?.persist?.().catch(() => {});
        }

        return cached.db;
    };

    const enumerable = <T>(arr: T[]) => {
        return makeEnumerable(arr);
    };

    const controller = (): { run: () => void } => {
        return AppController(self);
    };

    const self = {
        view:       view,
        controller: controller,
        router:     router,
        store:      store,
        database:   database,
        enumerable: enumerable,
        classy:     () => classy,
        session:    () => session,
        beep:       () => beep,
        sounds:     () => sounds,
        effort:     () => effort,
        guided:     () => guided,
        conversions: () => conversions,
        summarise:  () => summarise,
        format:     () => format,
        tools:      () => tools,
        document:   () => doc,
        wakeLock:   () => wakeLock,
        errorReporter: () => errorReporter.reporter,
    };

    // need to wrangle this a little so we can inject self into builders.
    return self;
};
