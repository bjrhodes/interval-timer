import { expect, test } from '@playwright/test';

const timer = (page) => ({
    section: page.locator('#timer'),
    time: page.locator('.current-interval__timer'),
    action: page.locator('.current-interval__action'),
    nextAction: page.locator('.next-interval__action'),
    status: page.locator('.interval-timer__status'),
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

        await expect(t.time).toHaveText('FIN');
        await expect(t.nextAction).toHaveText('-');

        await t.section.click();
        await expect(t.time).toHaveText('FIN');
        await expect(t.status).not.toHaveClass(/interval-timer__status--paused/);
    });
});
