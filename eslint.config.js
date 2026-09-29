import js from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['node_modules/', 'test-results/', 'playwright-report/'] },
    js.configs.recommended,
    {
        files: ['js/**/*.js'],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ['tests/**/*.js', '*.config.js'],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },
];
