import { defineConfig, devices } from '@playwright/test';

// the one Node global used here, declared rather than pulling in @types/node.
declare const process: { env: Record<string, string | undefined> };

const port = 4173;

export default defineConfig({
    testDir: 'tests/e2e',
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: `http://localhost:${port}`,
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    // serve the repo as static files, exactly as GitHub Pages would.
    webServer: {
        command: 'npm run serve',
        url: `http://localhost:${port}`,
        reuseExistingServer: !process.env.CI,
    },
});
