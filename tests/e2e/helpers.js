import { expect } from '@playwright/test';

// a first visit asks how to train; one-off training shows the library's next workout, as home did before plans.
export const chooseOneOff = async (page) => {
    await page.getByRole('button', { name: /^One-off training/ }).click();
    // waiting for the home page it re-renders also waits for the choice to save.
    await expect(page.getByRole('link', { name: 'Start workout' })).toBeVisible();
};
