import { expect, test } from '@playwright/test';

// Each test gets a fresh browser context, so no preferences are set until a test sets them.

const section = (page, id) => page.locator('.preferences__section[data-section="' + id + '"]');

// a change event saves, so leave the field rather than just typing into it.
const setPeak = async (page, label, value) => {
    await page.getByLabel(label).fill(String(value));
    await page.getByLabel(label).press('Tab');
};

const nav = (page, name) => page.getByRole('navigation').getByRole('link', { name: name }).click();

test('shows a heart rate workout in power once both peaks are set, and remembers the choice', async ({ page }) => {
    await page.goto('/preferences');
    await setPeak(page, 'Max heart rate', 190);
    await setPeak(page, 'Ramp test max', 400);

    // the next workout is Over Unders (3/2/3/2), planned by heart rate, which warms up at 130 bpm.
    await nav(page, 'Home');
    await page.getByRole('link', { name: 'Start workout' }).click();
    const mode = page.getByLabel('Show targets as'),
        effort = page.locator('.current-interval__effort');
    await expect(effort).toHaveText('130 bpm');

    await mode.selectOption('power');
    await expect(effort).toHaveText('211 W');
    await expect(page.locator('.interval-timer__status')).toHaveClass(/interval-timer__status--paused/);

    await page.getByRole('link', { name: 'Exit workout' }).click();
    await page.getByRole('link', { name: 'Start workout' }).click();
    await expect(effort).toHaveText('211 W');
    await page.reload();
    await expect(mode).toHaveValue('power');
    await expect(effort).toHaveText('211 W');
});

test('hides the mode switch until there is something to convert to', async ({ page }) => {
    await page.goto('/timer/threshold-ladder');
    await expect(page.locator('.current-interval__effort')).not.toBeEmpty();
    await expect(page.getByLabel('Show targets as')).toBeHidden();
});

test('edits the targets behind a peak in advanced mode', async ({ page }) => {
    await page.goto('/preferences');
    const power = section(page, 'power');
    await expect(power.getByLabel('Advanced')).toBeDisabled();
    await setPeak(page, 'Ramp test max', 400);

    await power.getByLabel('Advanced').check();
    await expect(power.getByLabel('7 - Very hard')).toHaveValue('300');
    await expect(power.getByLabel('10 - Max effort')).toHaveValue('400');

    // a target can't pass the one above it.
    await power.getByLabel('7 - Very hard').fill('999');
    await power.getByLabel('7 - Very hard').press('Tab');
    await expect(power.getByLabel('7 - Very hard')).toHaveValue('332');

    await nav(page, 'Home');
    await nav(page, 'Preferences');
    await expect(power.getByLabel('Advanced')).toBeChecked();
    await expect(power.getByLabel('7 - Very hard')).toHaveValue('332');

    // back to simple, the targets come from the peak again, after asking.
    page.once('dialog', (dialog) => dialog.accept());
    await power.getByLabel('Advanced').uncheck();
    await expect(page.getByLabel('Ramp test max')).toHaveValue('400');
    await power.getByLabel('Advanced').check();
    await expect(power.getByLabel('7 - Very hard')).toHaveValue('300');
});

test('converts targets when the editor switches to a mapped mode', async ({ page }) => {
    await page.goto('/preferences');
    await setPeak(page, 'Ramp test max', 400);

    await nav(page, 'Workouts');
    await page.locator('.workout-list__workout', { has: page.getByRole('heading', { name: 'Descending Intervals' }) })
        .getByRole('link', { name: 'Edit' }).click();
    // the warmup is RPE 3.
    await expect(page.locator('#interval-effort-1')).toHaveValue('3');

    await page.locator('.effort-mode__option', { hasText: 'Power' }).click();
    await expect(page.getByRole('radio', { name: 'Power' })).toBeChecked();
    await expect(page.locator('#interval-effort-1')).toHaveValue('192');
});
