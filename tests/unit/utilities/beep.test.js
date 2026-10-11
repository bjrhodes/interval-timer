import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Beep, sounds } from '../../../js/src/utilities/beep.js';

const ramp = () => ({exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn()});

describe('Beep', () => {
    let tones, volumes;

    beforeEach(() => {
        tones = [];
        volumes = [];
        vi.stubGlobal('AudioContext', vi.fn(function () {
            this.currentTime = 2;
            this.destination = {};
            this.resume ??= vi.fn(() => Promise.resolve());
        }));
        vi.stubGlobal('OscillatorNode', vi.fn(function (ctx, options) {
            Object.assign(this, options, {start: vi.fn(), stop: vi.fn(), frequency: ramp()});
            this.hz = options.frequency;
            this.connect = vi.fn((node) => node);
            tones.push(this);
        }));
        vi.stubGlobal('GainNode', vi.fn(function () {
            this.gain = ramp();
            this.connect = vi.fn();
            volumes.push(this);
        }));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('waits for a beep or an unlock before making an audio context', () => {
        Beep();
        expect(AudioContext).not.toHaveBeenCalled();
    });

    it('plays a soft blip by default: one short tone that fades out', () => {
        const beep = Beep();
        beep();

        const [tone] = tones;
        const ctx = AudioContext.mock.instances[0];
        expect(tones).toHaveLength(1);
        expect(tone).toMatchObject({type: 'sine', hz: sounds.softBlip.frequency});
        expect(tone.connect).toHaveBeenCalledWith(volumes[0]);
        expect(volumes[0].connect).toHaveBeenCalledWith(ctx.destination);
        expect(tone.start).toHaveBeenCalledWith(2);
        expect(tone.stop).toHaveBeenCalledWith(2.18);
        expect(volumes[0].gain.exponentialRampToValueAtTime).toHaveBeenLastCalledWith(0.0001, 2.18);
    });

    it('plays the chosen sound, with its second tone, and falls back to the soft blip for an unknown one', () => {
        const beep = Beep();
        beep.use('bell');
        beep();
        expect(tones.map((tone) => tone.hz)).toEqual([1046, 1046 * 2.76]);
        expect(volumes[1].gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.4 * 0.35, 2.003);

        beep.use('nonsense');
        beep();
        expect(tones[2].hz).toBe(sounds.softBlip.frequency);
    });

    it('fades and bends the pitch as the sound asks', () => {
        const beep = Beep();
        beep.use('digitalWatch');
        beep();
        expect(volumes[0].gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 2.06);

        beep.use('woodblock');
        beep();
        expect(tones[1].frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(840, 2.07);
    });

    it('spaces a double beep by the sound\'s gap', () => {
        const beep = Beep();
        beep.use('retro');
        beep.double();
        expect(tones.map((tone) => tone.start.mock.calls[0][0])).toEqual([2, 2, 2.14, 2.14]);
    });

    it('unlocks and beeps through one audio context', () => {
        const beep = Beep();
        beep.unlock();
        beep();
        beep();

        expect(AudioContext).toHaveBeenCalledOnce();
        expect(AudioContext.mock.instances[0].resume).toHaveBeenCalledOnce();
        expect(tones).toHaveLength(2);
    });

    it('swallows a refused unlock', async () => {
        AudioContext.prototype.resume = () => Promise.reject(new Error('NotAllowedError'));
        const beep = Beep();
        beep.unlock();
        // let the rejected promise settle; an unhandled rejection would fail the run.
        await Promise.resolve();
    });
});
