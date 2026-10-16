/**
 * Shapes shared across the app. Module-specific types live beside their code.
 */
import type { ModeId } from './utilities/effort.ts';
import type { Db } from './utilities/idb.ts';

export type Unit = 'seconds' | 'minutes' | 'hours';

export interface Interval {
    action: string;
    time: number;
    unit: Unit;
    // a target within the workout's effort mode; none means no target.
    effort?: number;
}

export interface Workout {
    id: string;
    title: string;
    effortMode: ModeId;
    intervals: Interval[];
    // set on the sessions a guided plan builds.
    plan?: boolean;
    test?: boolean;
}

export type SectionId = 'heartRate' | 'power' | 'speed';

// a conversion curve: the target at each RPE level, from 1 to 10.
export interface Curve {
    points?: number[];
    advanced?: boolean;
    // speed only: the unit its points are in.
    unit?: 'speedKmh' | 'speedMph';
}

export interface Preferences {
    id?: string;
    heartRate?: Curve;
    power?: Curve;
    speed?: Curve;
    timerMode?: ModeId;
    beep?: string;
    skipFanfare?: boolean;
    // how a first visit chose to train.
    start?: string;
}

export type TestId = 'ramp' | 'talk';

export interface TestResult {
    date: string;
    test: TestId;
    steps: number;
    value: number | null;
}

export interface Plan {
    mode: ModeId;
    // null by feel, which has nothing to calibrate.
    test: TestId | null;
    sessionsPerWeek?: number;
    level: number;
    block: number;
    results: TestResult[];
    completed: string[];
}

export type ViewName = 'editWorkout' | 'guide' | 'home' | 'preferences' | 'timer' | 'workouts';

export interface Route {
    path: string | RegExp;
    view: ViewName;
    id: string;
    nav?: string;
    description?: string;
}

export type State = Record<string, unknown>;

export type Reporter = (message: string) => void;

export interface View {
    setup: () => Promise<void>;
    teardown: () => void;
}

// what a store needs from the factory.
export interface StoreDeps {
    errorReporter: () => Reporter;
    database: () => Promise<Db>;
}
