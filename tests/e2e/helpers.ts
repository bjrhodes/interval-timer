import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// a first visit opens the guided setup; skipping it shows the library's next workout, as home did before plans.
export const skipSetup = async (page: Page) => {
    await page.getByRole('link', { name: 'Skip to home' }).click();
    // waiting for the home page also waits for the skip to save.
    await expect(page.getByRole('link', { name: 'Start workout' })).toBeVisible();
};
