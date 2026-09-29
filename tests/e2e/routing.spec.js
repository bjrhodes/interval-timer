import { expect, test } from '@playwright/test';

const sections = (page) => ({
    home: page.locator('#home'),
    workouts: page.locator('#workouts'),
    timer: page.locator('#timer'),
    edit: page.locator('#edit-workout'),
});

const workoutItem = (page, title) => page.locator('.workout-list__workout', {
    has: page.getByRole('heading', { name: title, exact: true }),
});

const expectOnlyVisible = async (page, name) => {
    const all = sections(page);
    for (const [key, section] of Object.entries(all)) {
        if (key === name) {
            await expect(section).toBeVisible();
        } else {
            await expect(section).toBeHidden();
        }
    }
};

test.describe('routing', () => {
    test('shows the next workout on the home page by default', async ({ page }) => {
        await page.goto('/');

        await expectOnlyVisible(page, 'home');
        const next = page.locator('.next-workout');
        await expect(next.getByRole('heading', { level: 1 })).toHaveText('Over Unders (3/2/3/2)');
        await expect(next.getByRole('link', { name: 'Start workout' })).toHaveAttribute('href', '/#timer/over-unders-3-2-3-2');
        await expect(page.locator('.upcoming-list__item')).toHaveCount(3);
    });

    test('lists every workout', async ({ page }) => {
        await page.goto('/#workouts');

        await expectOnlyVisible(page, 'workouts');
        await expect(page.locator('.workout-list__workout')).toHaveCount(11);
        await expect(workoutItem(page, 'Threshold Ladder')).toContainText('1 hour, 2 minutes');
    });

    test('falls back to the home page for an unknown route', async ({ page }) => {
        await page.goto('/#not-a-real-page');

        await expectOnlyVisible(page, 'home');
    });

    test('points nav links at routes under the base path', async ({ page }) => {
        await page.goto('/');
        const nav = page.getByRole('navigation');

        await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/#');
        await expect(nav.getByRole('link', { name: 'Workouts' })).toHaveAttribute('href', '/#workouts');
    });

    test('marks the current section in the nav', async ({ page }) => {
        await page.goto('/');
        const nav = page.getByRole('navigation');
        await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

        await page.goto('/#editworkout/threshold-ladder');
        await expect(nav.getByRole('link', { name: 'Workouts' })).toHaveAttribute('aria-current', 'page');
        await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current', 'page');
    });

    test('hides the nav while the timer is showing', async ({ page }) => {
        await page.goto('/#timer/threshold-ladder');

        await expect(page.getByRole('navigation')).toBeHidden();
    });

    test('keeps the base path when loaded via index.html', async ({ page }) => {
        await page.goto('/index.html');

        await expect(page.getByRole('navigation').getByRole('link', { name: 'Workouts' }))
            .toHaveAttribute('href', '/#workouts');
        await expect(page.locator('.next-workout').getByRole('link', { name: 'Start workout' }))
            .toHaveAttribute('href', '/#timer/over-unders-3-2-3-2');
    });

    test('starts a workout from the list', async ({ page }) => {
        await page.goto('/#workouts');
        await workoutItem(page, 'Threshold Ladder').getByRole('link', { name: 'Start' }).click();

        await expect(page).toHaveURL(/#timer\/threshold-ladder$/);
        await expectOnlyVisible(page, 'timer');
        await expect(page.locator('.current-interval__action')).toHaveText('Warmup');
        await expect(page.locator('.current-interval__timer')).toHaveText('0:14:00');
        await expect(page.locator('.next-interval__action')).toHaveText('GET READY! Bring RPM to 90, HR to 159');
    });

    test('starts the next workout from the home page', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Start workout' }).click();

        await expect(page).toHaveURL(/#timer\/over-unders-3-2-3-2$/);
        await expectOnlyVisible(page, 'timer');
    });

    test('edits a workout from the list', async ({ page }) => {
        await page.goto('/#workouts');
        await workoutItem(page, 'Threshold Ladder').getByRole('link', { name: 'Edit' }).click();

        await expect(page).toHaveURL(/#editworkout\/threshold-ladder$/);
        await expectOnlyVisible(page, 'edit');
        await expect(page.getByPlaceholder('Workout name')).toHaveValue('Threshold Ladder');
        await expect(page.getByRole('radio', { name: 'Heart Rate Zone' })).toBeChecked();
        await expect(page.locator('.interval-list__interval')).toHaveCount(14);
    });

    test('deep links straight to a workout timer', async ({ page }) => {
        await page.goto('/#timer/descending-intervals');

        await expectOnlyVisible(page, 'timer');
        await expect(page.locator('.current-interval__action')).toHaveText('Get set...');
        await expect(page.locator('.current-interval__timer')).toHaveText('0:01:00');
    });

    test('deep links straight to editing a workout', async ({ page }) => {
        await page.goto('/#editworkout/climbing-repeats');

        await expectOnlyVisible(page, 'edit');
        await expect(page.getByPlaceholder('Workout name')).toHaveValue('Climbing Repeats');
        await expect(page.getByRole('radio', { name: 'Power' })).toBeChecked();
    });

    test('creates a new workout from the list', async ({ page }) => {
        await page.goto('/#workouts');
        await page.getByRole('link', { name: 'New workout' }).click();

        await expect(page).toHaveURL(/#editworkout$/);
        await expectOnlyVisible(page, 'edit');
        await expect(page.getByPlaceholder('Workout name')).toHaveValue('');
        await expect(page.locator('.interval-list__interval')).toHaveCount(0);
        await expect(page.getByRole('link', { name: 'Start', exact: true })).toBeHidden();
    });

    test('builds a new workout and starts it', async ({ page }) => {
        await page.goto('/#editworkout');
        await page.getByPlaceholder('Workout name').fill('Quick Test');
        await page.getByPlaceholder('Workout name').press('Tab');
        await page.getByLabel('Interval title').fill('Sprint');
        await page.getByLabel('Duration').fill('20');
        await page.getByRole('link', { name: 'Add interval' }).click();

        await expect(page.locator('.edit-workout__summary')).toHaveText('1 intervals · 20 seconds');
        await page.getByRole('link', { name: 'Start', exact: true }).click();

        await expectOnlyVisible(page, 'timer');
        await expect(page.locator('.timer__title')).toHaveText('Quick Test');
        await expect(page.locator('.current-interval__action')).toHaveText('Sprint');
    });

    test('moves between views with the nav', async ({ page }) => {
        await page.goto('/');
        const nav = page.getByRole('navigation');

        await nav.getByRole('link', { name: 'Workouts' }).click();
        await expectOnlyVisible(page, 'workouts');

        await nav.getByRole('link', { name: 'Home' }).click();
        await expectOnlyVisible(page, 'home');
    });

    test('exits the timer back to the home page', async ({ page }) => {
        await page.goto('/#timer/threshold-ladder');
        await page.getByRole('link', { name: 'Exit workout' }).click();

        await expectOnlyVisible(page, 'home');
    });

    test('follows browser back and forward', async ({ page }) => {
        await page.goto('/#workouts');
        await workoutItem(page, 'Climbing Repeats').getByRole('link', { name: 'Start' }).click();
        await expectOnlyVisible(page, 'timer');

        await page.goBack();
        await expect(page).toHaveURL(/#workouts$/);
        await expectOnlyVisible(page, 'workouts');

        await page.goForward();
        await expect(page).toHaveURL(/#timer\/climbing-repeats$/);
        await expectOnlyVisible(page, 'timer');
        await expect(page.locator('.current-interval__action')).toHaveText('Warmup');
    });

    test('switches straight from one workout timer to another', async ({ page }) => {
        await page.goto('/#timer/threshold-ladder');
        await expect(page.locator('.current-interval__action')).toHaveText('Warmup');

        await page.evaluate(() => { window.location.hash = '#timer/descending-intervals'; });

        await expectOnlyVisible(page, 'timer');
        await expect(page.locator('.current-interval__action')).toHaveText('Get set...');
    });

    test('switches straight from editing one workout to another', async ({ page }) => {
        await page.goto('/#editworkout/threshold-ladder');
        await expect(page.getByPlaceholder('Workout name')).toHaveValue('Threshold Ladder');

        await page.evaluate(() => { window.location.hash = '#editworkout/climbing-repeats'; });

        await expectOnlyVisible(page, 'edit');
        await expect(page.getByPlaceholder('Workout name')).toHaveValue('Climbing Repeats');
    });

    test('keeps edits when moving to another view', async ({ page }) => {
        await page.goto('/#editworkout/threshold-ladder');
        await page.getByPlaceholder('Workout name').fill('Renamed Ladder');
        await page.getByPlaceholder('Workout name').press('Tab');

        await page.getByRole('navigation').getByRole('link', { name: 'Workouts' }).click();

        await expect(workoutItem(page, 'Renamed Ladder')).toBeVisible();
        await expect(workoutItem(page, 'Threshold Ladder')).toHaveCount(0);
    });

    test('stops a running timer when leaving it', async ({ page }) => {
        await page.clock.install();
        await page.goto('/#timer/threshold-ladder');
        const time = page.locator('.current-interval__timer');

        await page.locator('#timer').click();
        await page.clock.runFor(2000);
        await expect(time).not.toHaveText('0:14:00');

        await page.getByRole('link', { name: 'Exit workout' }).click();
        await expectOnlyVisible(page, 'home');
        const leftAt = await time.textContent();
        await page.clock.runFor(5000);

        await expect(time).toHaveText(leftAt);
    });
});
