// each sound is one tone, and optionally a quieter second one above it for colour; gap spaces a double beep (ms).
export const sounds = {
    softBlip:     {name: 'Soft blip', type: 'sine', frequency: 660, peak: 0.3, attack: 15, length: 180, curve: 'exponential', drop: 0, ratio: 2, level: 0, gap: 200},
    marimba:      {name: 'Marimba', type: 'sine', frequency: 520, peak: 0.6, attack: 2, length: 400, curve: 'exponential', drop: 0, ratio: 4, level: 0.25, gap: 180},
    bell:         {name: 'Bell', type: 'sine', frequency: 1046, peak: 0.4, attack: 3, length: 900, curve: 'exponential', drop: 0, ratio: 2.76, level: 0.35, gap: 250},
    woodblock:    {name: 'Woodblock', type: 'triangle', frequency: 1200, peak: 0.6, attack: 1, length: 70, curve: 'exponential', drop: 30, ratio: 2.3, level: 0.3, gap: 150},
    digitalWatch: {name: 'Digital watch', type: 'square', frequency: 3000, peak: 0.08, attack: 1, length: 60, curve: 'linear', drop: 0, ratio: 2, level: 0, gap: 120},
    retro:        {name: 'Retro', type: 'square', frequency: 988, peak: 0.12, attack: 2, length: 140, curve: 'exponential', drop: 0, ratio: 1.5, level: 0.4, gap: 140},
};

export const Beep = () => {
    let ctx = null,
        sound = sounds.softBlip;
    const context = () => (ctx ??= new AudioContext());

    // a quick fade in and a fade out keep it from clicking.
    const voice = (frequency, peak, start) => {
        const end = start + sound.length / 1000;
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

    const play = (delay) => {
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

    beep.use = (id) => {
        sound = sounds[id] || sounds.softBlip;
    };

    // browsers only let audio start from a tap, so call this from one.
    beep.unlock = () => {
        context().resume().catch(() => {});
    };

    return beep;
};
