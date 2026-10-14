import { expect, test } from '@playwright/test';
import { chooseOneOff } from './helpers.js';

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
    await chooseOneOff(page);
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

test('plays the chosen beep, remembers it, and the timer beeps with it', async ({ page }) => {
    await page.clock.install();
    await page.addInitScript(() => {
        window.tones = [];
        const start = OscillatorNode.prototype.start;
        OscillatorNode.prototype.start = function (...args) {
            window.tones.push(Math.round(this.frequency.value));
            return start.apply(this, args);
        };
    });
    const tones = () => page.evaluate(() => window.tones);

    await page.goto('/preferences');
    const sound = page.getByLabel('Sound');
    await expect(sound).toHaveValue('softBlip');
    await sound.selectOption('Bell');
    // the bell is two tones, the second a little under three times the first.
    await expect.poll(tones).toEqual([1046, 2887]);

    await page.reload();
    await expect(sound).toHaveValue('bell');

    // the first interval of the threshold ladder ends at 14:00, with a countdown beep in each of its last five seconds.
    await page.goto('/timer/threshold-ladder');
    await page.locator('#timer').click();
    await page.clock.fastForward('13:58');
    await expect.poll(tones).toContain(1046);
    expect((await tones()).every((hz) => hz === 1046 || hz === 2887)).toBe(true);
});

test('ends a workout with a fanfare, previews it, and skips it when asked', async ({ page }) => {
    await page.clock.install();
    await page.addInitScript(() => {
        window.waves = [];
        const start = OscillatorNode.prototype.start;
        OscillatorNode.prototype.start = function (...args) {
            window.waves.push(this.type);
            return start.apply(this, args);
        };
    });
    // the soft blip's fanfare is synth brass: 13 notes of two saws each.
    const saws = async () => (await page.evaluate(() => window.waves)).filter((type) => type === 'sawtooth').length;
    const finish = async () => {
        await page.goto('/timer/threshold-ladder');
        await expect(page.locator('.timer__title')).toHaveText('Threshold Ladder');
        await page.locator('#timer').click();
        await page.clock.fastForward('02:00:00');
        await expect(page.locator('.current-interval__timer')).toHaveText('Done');
    };

    await finish();
    await expect.poll(saws).toBe(26);

    await page.goto('/preferences');
    const skip = page.getByLabel('Skip fanfare');
    await expect(skip).not.toBeChecked();
    // a reload would cut off the save, so leave and come back with the app's own links.
    const saved = async () => {
        await nav(page, 'Home');
        await nav(page, 'Preferences');
        await expect(skip).toBeChecked();
    };
    await skip.check();
    await saved();
    // turning it back on plays it.
    await skip.uncheck();
    await expect.poll(saws).toBe(26);
    await skip.check();
    await saved();

    await finish();
    // the last interval still ends with its double beep.
    await expect.poll(async () => (await page.evaluate(() => window.waves)).length).toBeGreaterThan(0);
    expect(await saws()).toBe(0);
});
