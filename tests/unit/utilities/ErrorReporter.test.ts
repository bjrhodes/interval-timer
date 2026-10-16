import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorReporter } from '../../../src/utilities/ErrorReporter.ts';

describe('ErrorReporter', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('logs reported messages to the console', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        ErrorReporter().reporter('Timer view could not read intervals.');
        expect(log).toHaveBeenCalledWith('Timer view could not read intervals.');
    });
});
