import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorReporter } from '../../../js/src/utilities/ErrorReporter.js';

describe('ErrorReporter', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('logs reported messages to the console', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        ErrorReporter(window).reporter('Timer view could not read intervals.');
        expect(log).toHaveBeenCalledWith('Timer view could not read intervals.');
    });
});
