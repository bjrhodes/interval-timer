import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { Beep, sounds } from '../../../src/utilities/beep.ts';

const ramp = () => ({setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn()});

type Ramp = ReturnType<typeof ramp>;

// the fake nodes, with the frequency and detune each tone was made with as hz and cents.
interface FakeTone {
    type: OscillatorType;
    hz: number;
    cents?: number;
    frequency: Ramp;
    start: Mock;
    stop: Mock;
    connect: Mock;
}

interface FakeVolume {
    gain: Ramp;
    connect: Mock;
}

const hz = (note: number) => 440 * 2 ** ((note - 69) / 12);

describe('Beep', () => {
    let tones: FakeTone[], volumes: FakeVolume[];

    beforeEach(() => {
        tones = [];
        volumes = [];
        vi.stubGlobal('AudioContext', vi.fn(function (this: { currentTime: number; destination: object; resume?: Mock }) {
            this.currentTime = 2;
            this.destination = {};
            this.resume ??= vi.fn(() => Promise.resolve());
        }));
        vi.stubGlobal('OscillatorNode', vi.fn(function (this: FakeTone, ctx: BaseAudioContext, options: OscillatorOptions & { frequency: number }) {
            Object.assign(this, options, {start: vi.fn(), stop: vi.fn(), frequency: ramp(), detune: {}});
            this.hz = options.frequency;
            this.cents = options.detune;
            this.connect = vi.fn((node: AudioNode) => node);
            tones.push(this);
        }));
        vi.stubGlobal('GainNode', vi.fn(function (this: FakeVolume) {
            this.gain = ramp();
            this.connect = vi.fn((node: AudioNode) => node);
            volumes.push(this);
        }));
        vi.stubGlobal('BiquadFilterNode', vi.fn(function (this: { frequency: Ramp; connect: Mock }) {
            this.frequency = ramp();
            this.connect = vi.fn((node: AudioNode) => node);
        }));
        vi.stubGlobal('DynamicsCompressorNode', vi.fn(function (this: { connect: Mock }) {
            this.connect = vi.fn();
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
        const ctx = vi.mocked(AudioContext).mock.instances[0];
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

    describe('fanfare', () => {
        const fanfare = (id: string) => {
            const beep = Beep();
            beep.use(id);
            beep.fanfare();
            return tones;
        };
        const firstStarts = () => tones.map((tone) => tone.start.mock.calls[0][0]);

        it('plays triumphant synth brass for the soft blip, the woodblock and an unknown sound', () => {
            for (const id of ['softBlip', 'woodblock', 'nonsense']) {
                tones = [];
                fanfare(id);
                const saws = tones.filter((tone) => tone.type === 'sawtooth');
                // 13 notes, each two saws detuned either side of the note.
                expect(saws).toHaveLength(26);
                expect(saws.slice(0, 2)).toMatchObject([{hz: hz(67), cents: -9}, {hz: hz(67), cents: 9}]);
                // the closing chord's four notes are long enough for vibrato.
                expect(tones.filter((tone) => tone.type === 'sine').map((tone) => tone.hz)).toEqual([5.5, 5.5, 5.5, 5.5]);
            }
        });

        it('plays Charge! as a square wave for the retro and digital watch beeps', () => {
            for (const id of ['retro', 'digitalWatch']) {
                tones = [];
                fanfare(id);
                expect(tones.every((tone) => tone.type === 'square')).toBe(true);
                expect(tones.map((tone) => Math.round(tone.hz))).toEqual([392, 523, 659, 784, 659, 784, 523, 659]);
            }
        });

        it('plays Level up on the marimba, and Charge! on the bell, each with its beep\'s overtone', () => {
            fanfare('marimba');
            expect(tones.slice(0, 2).map((tone) => tone.hz)).toEqual([hz(60), hz(60) * 4]);
            expect(tones).toHaveLength(22);

            tones = [];
            fanfare('bell');
            expect(tones.slice(0, 2).map((tone) => tone.hz)).toEqual([hz(67), hz(67) * 2.76]);
            expect(tones.every((tone) => tone.type === 'sine')).toBe(true);
        });

        it('schedules every note on the audio clock, through a compressor', () => {
            fanfare('retro');
            const ctx = vi.mocked(AudioContext).mock.instances[0];
            expect(firstStarts()[0]).toBeCloseTo(2.05);
            // the last chord starts six beats in.
            expect(firstStarts().at(-1)).toBeCloseTo(2.05 + 6 * 0.15);
            expect(volumes[0].connect).toHaveBeenCalledWith(vi.mocked(DynamicsCompressorNode).mock.instances[0]);
            expect(vi.mocked(DynamicsCompressorNode).mock.instances[0].connect).toHaveBeenCalledWith(ctx.destination);
        });
    });

    it('unlocks and beeps through one audio context', () => {
        const beep = Beep();
        beep.unlock();
        beep();
        beep();

        expect(AudioContext).toHaveBeenCalledOnce();
        expect(vi.mocked(AudioContext).mock.instances[0].resume).toHaveBeenCalledOnce();
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
