import { effort } from './effort.ts';
import { format } from './format.ts';
import type { Interval, Workout } from '../types.ts';

const { timeInSeconds, durationAsWords } = format();

/**
 * The at-a-glance facts about a workout that lists and cards show: how long it is, how many intervals it has and
 * what its efforts are measured in.
 */
export const summarise = (workout?: Pick<Workout, 'intervals' | 'effortMode'> | null) => {
    const intervals = (workout && workout.intervals instanceof Array ? workout.intervals : [])
        .filter((interval: Interval | null) => interval && !isNaN(1 + interval.time)) as Interval[];
    const seconds = intervals.reduce((total, interval) => total + timeInSeconds(interval.time, interval.unit), 0);

    return {
        seconds: seconds,
        duration: seconds ? durationAsWords(seconds) : 'No intervals yet',
        intervals: intervals.length,
        effortMode: effort.mode(workout && workout.effortMode).label,
    };
};
