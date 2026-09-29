import { describe, expect, it } from 'vitest';
import { summarise } from '../../../js/src/utilities/summary.js';

describe('summarise', () => {
    it('totals the intervals across units', () => {
        const summary = summarise({
            effortMode: 'power',
            intervals: [
                {action: 'Warmup', time: 10, unit: 'minutes'},
                {action: 'Burst', time: 30, unit: 'seconds'},
            ],
        });
        expect(summary).toEqual({
            seconds: 630,
            duration: '10 minutes, 30 seconds',
            intervals: 2,
            effortMode: 'Power',
        });
    });

    it('skips holes and intervals without a time', () => {
        const summary = summarise({intervals: [undefined, {action: 'No time'}, {time: 5, unit: 'seconds'}]});
        expect(summary.seconds).toBe(5);
        expect(summary.intervals).toBe(1);
    });

    it('copes with an empty or missing workout', () => {
        expect(summarise({}).duration).toBe('No intervals yet');
        expect(summarise(undefined).intervals).toBe(0);
        expect(summarise(undefined).effortMode).toBe('Perceived effort');
    });
});
