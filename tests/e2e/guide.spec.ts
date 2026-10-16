import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { chooseOneOff } from './helpers.ts';

// Each test gets a fresh browser context, so every test starts as a first visit.

const nav = (page: Page, name: string) => page.getByRole('navigation').getByRole('link', { name: name }).click();

const title = (page: Page) => page.locator('.next-workout__title');

// from the first visit to the test's ready page.
const startGuided = async (page: Page, metric: string, test: string) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^Guided plan/ }).click();
    await page.getByRole('button', { name: new RegExp('^' + metric) }).click();
    await page.getByRole('button', { name: new RegExp('^' + test) }).click();
    await expect(page.getByRole('link', { name: 'Start the test' })).toBeVisible();
};

const enterResult = async (page: Page, results: Record<string, number>) => {
    for (const [label, value] of Object.entries(results)) {
        await page.getByLabel(label).fill(String(value));
    }
};

test('asks how to train on a first visit, and remembers one-off training', async ({ page }) => {
    await page.goto('/');
    await expect(title(page)).toHaveText('How do you want to train?');
    await expect(page.getByRole('link', { name: /^Guided plan/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Self-made plan/ })).toBeVisible();

    await chooseOneOff(page);
    await expect(title(page)).toHaveText('Over Unders (3/2/3/2)');
    await nav(page, 'Workouts');
    await nav(page, 'Home');
    await expect(title(page)).toHaveText('Over Unders (3/2/3/2)');
});

test('opens the library for a self-made plan', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^Self-made plan/ }).click();
    await expect(page.locator('#workouts')).toBeVisible();

    await nav(page, 'Home');
    await expect(title(page)).toHaveText('Over Unders (3/2/3/2)');
});

test('calibrates a power meter with the ramp test, then sets targets in watts', async ({ page }) => {
    await startGuided(page, 'Power meter', 'Ramp test');
    await page.getByRole('link', { name: 'Start the test' }).click();

    await expect(page.locator('.timer__title')).toHaveText('Ramp test');
    await expect(page.locator('.current-interval__effort')).toHaveText('3 - Moderate');
    await page.getByRole('link', { name: 'Exit workout' }).click();

    await expect(title(page)).toHaveText('Ramp test');
    await page.getByRole('link', { name: 'Enter result' }).click();
    await enterResult(page, { 'Steps you finished': 15, 'Your power over the last full step': 300 });
    await expect(page.getByLabel('Sessions a week you can manage')).toHaveAccessibleDescription(/A session is one ride/);
    await page.getByLabel('Sessions a week you can manage').selectOption('3');
    await page.getByRole('button', { name: 'Build my plan' }).click();

    await expect(page.getByRole('heading', { name: 'Your plan is ready' })).toBeVisible();
    await page.getByRole('link', { name: 'See your plan' }).click();
    await expect(title(page)).toHaveText('Block 1, week 1: Threshold');
    await expect(page.locator('.upcoming-list__item')).toHaveCount(3);

    // the warm-up is RPE 3, 48% of the ramp peak.
    await page.getByRole('link', { name: 'Start workout' }).click();
    await expect(page.locator('.current-interval__effort')).toHaveText('144 W');
    await page.getByRole('link', { name: 'Exit workout' }).click();

    await nav(page, 'Preferences');
    await expect(page.getByLabel('Ramp test max')).toHaveValue('300');
});

test('plans by feel straight away, with no test', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /^Guided plan/ }).click();
    await page.getByRole('button', { name: /^Just how it feels/ }).click();

    await expect(page.getByRole('button', { name: /^Ramp test/ })).toHaveCount(0);
    await page.getByLabel('Sessions a week you can manage').selectOption('2');
    await page.getByRole('button', { name: 'Build my plan' }).click();
    await expect(page.getByRole('heading', { name: 'Your plan is ready' })).toBeVisible();
    await page.getByRole('link', { name: 'See your plan' }).click();

    await expect(title(page)).toHaveText('Block 1, week 1: Threshold');
    await page.getByRole('link', { name: 'Start workout' }).click();
    await expect(page.locator('.current-interval__effort')).toHaveText('3 - Moderate');
    await expect(page.getByLabel('Show targets as')).toBeHidden();
});

test('moves on when a session is finished in the timer or marked done', async ({ page }) => {
    await startGuided(page, 'Heart rate monitor', 'Ramp test');
    await page.getByRole('link', { name: 'Enter result' }).click();
    await enterResult(page, { 'Steps you finished': 12, 'Your heart rate over the last full step': 185 });
    await page.getByRole('button', { name: 'Build my plan' }).click();
    await page.getByRole('link', { name: 'See your plan' }).click();

    await page.clock.install();
    await page.getByRole('link', { name: 'Start workout' }).click();
    await expect(page.locator('.timer__title')).toHaveText('Block 1, week 1: Threshold');
    await page.locator('#timer').click();
    await page.clock.fastForward('02:00:00');
    await expect(page.locator('.current-interval__action')).toHaveText('Workout complete');
    await page.getByRole('link', { name: 'Exit workout' }).click();
    await expect(title(page)).toHaveText('Block 1, week 1: Endurance');

    await page.getByRole('button', { name: 'Mark done' }).click();
    await expect(title(page)).toHaveText('Block 1, week 1: VO2 max');
});

test('a retest moves on to the next block and shows the progress', async ({ page }) => {
    await startGuided(page, 'Power meter', 'Ramp test');
    await page.getByRole('link', { name: 'Enter result' }).click();
    await enterResult(page, { 'Steps you finished': 15, 'Your power over the last full step': 300 });
    await page.getByRole('button', { name: 'Build my plan' }).click();
    await page.getByRole('link', { name: 'See your plan' }).click();
    await expect(page.locator('.home__progress')).toBeHidden();

    for (let done = 0; done < 11; done++) {
        const before = (await title(page).textContent()) ?? '';
        await page.getByRole('button', { name: 'Mark done' }).click();
        await expect(title(page)).not.toHaveText(before);
    }
    await expect(title(page)).toHaveText('Block 1, week 4: Ramp test');
    await page.getByRole('link', { name: 'Enter result' }).click();
    await expect(page.getByLabel('Sessions a week you can manage')).toHaveCount(0);
    await enterResult(page, { 'Steps you finished': 17, 'Your power over the last full step': 330 });
    await page.getByRole('button', { name: 'Save result' }).click();

    await expect(page.getByRole('heading', { name: 'Block 2 is ready' })).toBeVisible();
    await page.getByRole('link', { name: 'See your plan' }).click();
    await expect(title(page)).toHaveText('Block 2, week 1: Threshold');
    const progress = page.locator('.home__progress');
    await expect(progress).toContainText('steps, from 15 (+13%)');
    await expect(progress).toContainText('330 W');
    await expect(progress).toContainText('from 300 W (+10%)');
});
