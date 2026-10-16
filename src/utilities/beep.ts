export type VoiceName = 'brass' | 'chip' | 'bell' | 'marimba';
export type TuneName = 'triumphant' | 'charge' | 'levelUp';

export interface Sound {
    name: string;
    type: OscillatorType;
    frequency: number;
    peak: number;
    attack: number;
    length: number;
    curve: 'linear' | 'exponential';
    drop: number;
    ratio: number;
    level: number;
    gap: number;
    fanfare: [VoiceName, TuneName];
}

// plays one note into out, between start and end, at a loudness of up to 1.
type Voice = (ctx: BaseAudioContext, frequency: number, start: number, end: number, loudness: number, out: AudioNode) => void;

// each sound is one tone, and optionally a quieter second one above it for colour; gap spaces a double beep (ms).
// fanfare is the voice and tune that ends a workout.
export const sounds: Record<string, Sound> = {
    softBlip:     {name: 'Soft blip', type: 'sine', frequency: 660, peak: 0.3, attack: 15, length: 180, curve: 'exponential', drop: 0, ratio: 2, level: 0, gap: 200, fanfare: ['brass', 'triumphant']},
    marimba:      {name: 'Marimba', type: 'sine', frequency: 520, peak: 0.6, attack: 2, length: 400, curve: 'exponential', drop: 0, ratio: 4, level: 0.25, gap: 180, fanfare: ['marimba', 'levelUp']},
    bell:         {name: 'Bell', type: 'sine', frequency: 1046, peak: 0.4, attack: 3, length: 900, curve: 'exponential', drop: 0, ratio: 2.76, level: 0.35, gap: 250, fanfare: ['bell', 'charge']},
    woodblock:    {name: 'Woodblock', type: 'triangle', frequency: 1200, peak: 0.6, attack: 1, length: 70, curve: 'exponential', drop: 30, ratio: 2.3, level: 0.3, gap: 150, fanfare: ['brass', 'triumphant']},
    digitalWatch: {name: 'Digital watch', type: 'square', frequency: 3000, peak: 0.08, attack: 1, length: 60, curve: 'linear', drop: 0, ratio: 2, level: 0, gap: 120, fanfare: ['chip', 'charge']},
    retro:        {name: 'Retro', type: 'square', frequency: 988, peak: 0.12, attack: 2, length: 140, curve: 'exponential', drop: 0, ratio: 1.5, level: 0.4, gap: 140, fanfare: ['chip', 'charge']},
};

// a fanfare beat, in seconds.
const BEAT = 0.15;

// each note: [start beat, length in beats, midi notes...].
export const tunes: Record<TuneName, [number, number, ...number[]][]> = {
    triumphant: [[0, 0.6, 67], [0.67, 0.6, 67], [1.33, 0.6, 67], [2, 3, 72, 64], [5, 1, 74, 65], [6, 1, 76, 67], [7, 9, 79, 72, 76, 60]],
    charge: [[0, 0.8, 67], [1, 0.8, 72], [2, 0.8, 76], [3, 1.6, 79], [5, 0.8, 76], [6, 7, 79, 72, 76]],
    levelUp: [[0, 0.4, 60], [0.4, 0.4, 64], [0.8, 0.4, 67], [1.2, 0.4, 72], [1.6, 0.4, 76], [2, 0.4, 79], [2.4, 0.4, 84], [3, 0.6, 79], [3.6, 6, 84, 88, 91]],
};

const run = <T extends AudioScheduledSourceNode>(node: T, out: AudioNode, start: number, stop: number) => {
    node.connect(out);
    node.start(start);
    node.stop(stop);
    return node;
};

// fades in, then either holds until end and fades out over release, or just decays away by end; returns when it's silent.
const envelope = (gain: AudioParam, start: number, end: number, peak: number, attack: number, release = 0) => {
    gain.setValueAtTime(0.0001, start);
    gain.exponentialRampToValueAtTime(peak, start + attack);
    if (release) {
        gain.linearRampToValueAtTime(peak * 0.8, end);
        end += release;
    }
    gain.exponentialRampToValueAtTime(0.0001, end);
    return end;
};

// a struck sound rings for at least `ring` seconds, with the beep's own overtone.
const struck = ({ratio, level, peak}: Sound, ring: number): Voice => (ctx, frequency, start, end, loudness, out) => {
    [[1, 1], [ratio, level]].forEach(([r, l]) => {
        const volume = new GainNode(ctx);
        volume.connect(out);
        run(new OscillatorNode(ctx, {type: 'sine', frequency: frequency * r}), volume, start,
            envelope(volume.gain, start, start + Math.max(end - start, ring), peak * l * loudness, 0.003));
    });
};

// each plays one note into out, between start and end, at a loudness of up to 1.
export const voices: Record<VoiceName, Voice> = {
    // two detuned saws through a filter that opens on each note, with vibrato creeping into the long ones.
    brass: (ctx, frequency, start, end, loudness, out) => {
        const filter = new BiquadFilterNode(ctx, {type: 'lowpass', Q: 3}),
            volume = new GainNode(ctx),
            stop = envelope(volume.gain, start, end, 0.5 * loudness, 0.03, 0.18),
            saws = [-9, 9].map((detune) => run(new OscillatorNode(ctx, {type: 'sawtooth', frequency, detune}), filter, start, stop));
        filter.frequency.setValueAtTime(500, start);
        filter.frequency.linearRampToValueAtTime(frequency * 6, start + 0.06);
        filter.frequency.exponentialRampToValueAtTime(frequency * 3, start + 0.35);
        filter.connect(volume);
        volume.connect(out);
        if (end - start > 0.5) {
            const depth = new GainNode(ctx, {gain: 0});
            depth.gain.setValueAtTime(0, start + 0.25);
            depth.gain.linearRampToValueAtTime(14, start + 0.6);
            saws.forEach((saw) => depth.connect(saw.detune));
            run(new OscillatorNode(ctx, {type: 'sine', frequency: 5.5}), depth, start, stop);
        }
    },
    chip: (ctx, frequency, start, end, loudness, out) => {
        const volume = new GainNode(ctx);
        volume.connect(out);
        run(new OscillatorNode(ctx, {type: 'square', frequency}), volume, start,
            envelope(volume.gain, start, end, 0.14 * loudness, 0.005, 0.06));
    },
    bell: struck(sounds.bell, 0.9),
    marimba: struck(sounds.marimba, 0.45),
};

export const Beep = () => {
    let ctx: AudioContext | null = null,
        sound = sounds.softBlip;
    const context = () => (ctx ??= new AudioContext());

    // a quick fade in and a fade out keep it from clicking.
    const voice = (frequency: number, peak: number, start: number) => {
        const ctx = context(),
            end = start + sound.length / 1000;
        const tone = new OscillatorNode(ctx, {type: sound.type, frequency});
        const volume = new GainNode(ctx, {gain: 0.0001});
        volume.gain.exponentialRampToValueAtTime(peak, start + sound.attack / 1000);
        if (sound.curve === 'linear') {
            volume.gain.linearRampToValueAtTime(0, end);
        } else {
            volume.gain.exponentialRampToValueAtTime(0.0001, end);
        }
        if (sound.drop > 0) {
            tone.frequency.exponentialRampToValueAtTime(frequency * (1 - sound.drop / 100), end);
        }
        tone.connect(volume).connect(ctx.destination);
        tone.start(start);
        tone.stop(end);
    };

    const play = (delay: number) => {
        const start = context().currentTime + delay;
        voice(sound.frequency, sound.peak, start);
        if (sound.level > 0) {
            voice(sound.frequency * sound.ratio, sound.peak * sound.level, start);
        }
    };

    const beep = () => play(0);

    // scheduled on the audio clock, so the gap holds even in a throttled background tab.
    beep.double = () => {
        play(0);
        play(sound.gap / 1000);
    };

    // the whole tune goes on the audio clock at once, so it plays out in full in a throttled background tab.
    // chords are quieter per note, and a compressor catches what's left, so they don't clip.
    beep.fanfare = () => {
        const [voice, tune] = sound.fanfare,
            ctx = context(),
            start = ctx.currentTime + 0.05,
            out = new DynamicsCompressorNode(ctx, {threshold: -18, ratio: 6});
        out.connect(ctx.destination);
        tunes[tune].forEach(([at, length, ...notes]) => notes.forEach((note) => {
            voices[voice](ctx, 440 * 2 ** ((note - 69) / 12), start + at * BEAT, start + (at + length) * BEAT,
                1 / Math.sqrt(notes.length), out);
        }));
    };

    beep.use = (id?: string) => {
        sound = (id && sounds[id]) || sounds.softBlip;
    };

    // browsers only let audio start from a tap, so call this from one.
    beep.unlock = () => {
        context().resume().catch(() => {});
    };

    return beep;
};
