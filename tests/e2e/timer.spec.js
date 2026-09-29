import { expect, test } from '@playwright/test';

const timer = (page) => ({
    section: page.locator('#timer'),
    time: page.locator('.current-interval__timer'),
    action: page.locator('.current-interval__action'),
    nextAction: page.locator('.next-interval__action'),
    status: page.locator('.interval-timer__status'),
    effort: page.locator('.current-interval__effort'),
    nextTime: page.locator('.next-interval__time'),
    remaining: page.locator('.timer__remaining'),
    progress: page.getByRole('progressbar'),
});

test.describe('timer', () => {
    test.beforeEach(async ({ page }) => {
        await page.clock.install();
        await page.goto('/#timer/threshold-ladder');
    });

    test('waits, paused, until clicked', async ({ page }) => {
        const t = timer(page);

        await page.clock.fastForward('01:00');
        await expect(t.time).toHaveText('0:14:00');
        await expect(t.status).toHaveClass(/interval-timer__status--paused/);
    });

    test('counts down and moves on to the next interval', async ({ page }) => {
        const t = timer(page);
        await t.section.click();
        await expect(t.status).not.toHaveClass(/interval-timer__status--paused/);

        await page.clock.fastForward('00:10');
        await expect(t.time).toHaveText('0:13:50');

        await page.clock.fastForward('13:50');
        await expect(t.action).toHaveText('GET READY! Bring RPM to 90, HR to 159');
    });

    test('holds the time while paused, then resumes', async ({ page }) => {
        const t = timer(page);
        await t.section.click();
        await page.clock.fastForward('00:30');
        await expect(t.time).toHaveText('0:13:30');

        await t.section.click();
        await expect(t.status).toHaveClass(/interval-timer__status--paused/);
        await page.clock.fastForward('05:00');
        await expect(t.time).toHaveText('0:13:30');

        await t.section.click();
        await page.clock.fastForward('00:30');
        await expect(t.time).toHaveText('0:13:00');
    });

    test('finishes, and ignores clicks afterwards', async ({ page }) => {
        const t = timer(page);
        await t.section.click();
        await page.clock.fastForward('02:00:00');

        await expect(t.time).toHaveText('Done');
        await expect(t.action).toHaveText('Workout complete');
        await expect(t.remaining).toHaveText('0:00:00 left');

        await t.section.click();
        await expect(t.time).toHaveText('Done');
        await expect(t.status).not.toHaveClass(/interval-timer__status--paused/);
    });

    test('shows the workout, its total time and each effort target up front', async ({ page }) => {
        const t = timer(page);

        await expect(page.locator('.timer__title')).toHaveText('Threshold Ladder');
        await expect(t.remaining).toHaveText('1:02:00 left');
        await expect(t.effort).toHaveText('Z2 - Endurance (60-70% max)');
        await expect(t.nextTime).toHaveText('0:01:00 · Z3 - Tempo (70-80% max)');
    });

    test('tracks progress through the whole workout', async ({ page }) => {
        const t = timer(page);
        await t.section.click();
        await page.clock.fastForward('31:00');

        await expect(t.remaining).toHaveText('0:31:00 left');
        await expect(t.progress).toHaveAttribute('aria-valuenow', '50');
    });

    test('plays and pauses with the space bar', async ({ page }) => {
        const t = timer(page);

        await page.keyboard.press('Space');
        await expect(t.status).not.toHaveClass(/interval-timer__status--paused/);
        await expect(t.status).toHaveAccessibleName('Pause');

        await page.keyboard.press('Space');
        await expect(t.status).toHaveClass(/interval-timer__status--paused/);
    });

    test('plays and pauses with the button, toggling once per press', async ({ page }) => {
        const t = timer(page);

        await t.status.click();
        await expect(t.status).not.toHaveClass(/interval-timer__status--paused/);

        await t.status.press('Space');
        await expect(t.status).toHaveClass(/interval-timer__status--paused/);
    });
});

test('says so when the workout does not exist', async ({ page }) => {
    await page.goto('/#timer/no-such-workout');

    await expect(page.locator('.current-interval__action')).toHaveText('Workout not found');
    await expect(page.locator('.current-interval__timer')).toHaveText('--');
});
