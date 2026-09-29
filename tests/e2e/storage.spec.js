import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

// Each test gets a fresh browser context, so a fresh IndexedDB seeded with the built-in library.

const workoutItem = (page, title) => page.locator('.workout-list__workout', {
    has: page.getByRole('heading', { name: title, exact: true }),
});

const exported = {
    version: 1,
    exportedAt: '2026-09-29T00:00:00.000Z',
    workouts: [
        {
            id: 'imported-1',
            title: 'Imported Sprints',
            effortMode: 'perceived',
            intervals: [{ action: 'Sprint', time: 20, unit: 'seconds', effort: 9 }],
        },
        { id: 'broken', title: 'No intervals' },
    ],
};

test('keeps an edited workout after a reload', async ({ page }) => {
    await page.goto('/#editworkout/threshold-ladder');
    await page.getByPlaceholder('Workout name').fill('Renamed Ladder');
    await page.getByPlaceholder('Workout name').press('Tab');
    await page.goto('/#workouts');
    await page.reload();

    await expect(workoutItem(page, 'Renamed Ladder')).toBeVisible();
    await expect(workoutItem(page, 'Threshold Ladder')).toHaveCount(0);
});

test('keeps a new workout after a reload, at the end of the library', async ({ page }) => {
    await page.goto('/#editworkout');
    await page.getByPlaceholder('Workout name').fill('Quick Test');
    await page.getByPlaceholder('Workout name').press('Tab');
    await page.getByLabel('Interval title').fill('Sprint');
    await page.getByLabel('Duration').fill('20');
    await page.getByRole('link', { name: 'Add interval' }).click();
    await page.goto('/#workouts');
    await page.reload();

    await expect(page.locator('.workout-list__workout')).toHaveCount(12);
    await expect(page.locator('.workout-list__title').last()).toHaveText('Quick Test');
});

test('deletes a workout, after asking', async ({ page }) => {
    await page.goto('/#workouts');

    page.once('dialog', (dialog) => dialog.dismiss());
    await workoutItem(page, 'Climbing Repeats').getByRole('button', { name: 'Delete' }).click();
    await expect(workoutItem(page, 'Climbing Repeats')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await workoutItem(page, 'Climbing Repeats').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('status')).toHaveText('Deleted "Climbing Repeats".');
    await expect(workoutItem(page, 'Climbing Repeats')).toHaveCount(0);

    await page.reload();
    await expect(page.locator('.workout-list__workout')).toHaveCount(10);
    await expect(workoutItem(page, 'Climbing Repeats')).toHaveCount(0);
});

test('exports every workout as a JSON file', async ({ page }) => {
    await page.goto('/#workouts');

    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: 'Export' }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^interval-timer-workouts-\d{4}-\d{2}-\d{2}\.json$/);
    const data = JSON.parse(await readFile(await download.path(), 'utf8'));
    expect(data.version).toBe(1);
    expect(data.workouts).toHaveLength(11);
    expect(data.workouts[0].id).toBe('over-unders-3-2-3-2');
    expect(data.workouts[0]).not.toHaveProperty('order');
    await expect(page.getByRole('status')).toHaveText('Exported 11 workouts.');
});

test('imports workouts from a file, skipping any that are not valid', async ({ page }) => {
    await page.goto('/#workouts');

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByLabel('Import').setInputFiles({
        name: 'workouts.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(exported)),
    });

    await expect(page.getByRole('status')).toHaveText('Imported 1 workouts, skipped 1 that were not valid.');
    await expect(page.locator('.workout-list__title').last()).toHaveText('Imported Sprints');

    await page.reload();
    await expect(workoutItem(page, 'Imported Sprints')).toBeVisible();
    await expect(page.locator('.workout-list__workout')).toHaveCount(12);
});

test('says so when an imported file is not an export', async ({ page }) => {
    await page.goto('/#workouts');

    await page.getByLabel('Import').setInputFiles({
        name: 'notes.json',
        mimeType: 'application/json',
        buffer: Buffer.from('not json'),
    });

    await expect(page.getByRole('status')).toHaveText('That file could not be read. Choose a file exported from this app.');
    await expect(page.locator('.workout-list__workout')).toHaveCount(11);
});

test('restores a library from an export after everything is deleted', async ({ page }) => {
    await page.goto('/#workouts');
    const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: 'Export' }).click(),
    ]);
    const backup = await readFile(await download.path());

    page.on('dialog', (dialog) => dialog.accept());
    for (let i = 0; i < 11; i++) {
        await page.getByRole('button', { name: 'Delete' }).first().click();
        await expect(page.locator('.workout-list__workout')).toHaveCount(10 - i);
    }
    await page.reload();
    await expect(page.locator('.workout-list')).toHaveText('No workouts yet.');

    await page.getByLabel('Import').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: backup });

    await expect(page.locator('.workout-list__workout')).toHaveCount(11);
    await expect(page.locator('.workout-list__title').first()).toHaveText('Over Unders (3/2/3/2)');
});
