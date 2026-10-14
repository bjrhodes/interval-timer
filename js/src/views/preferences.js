/**
 * Effort conversions: a peak from a test per section, which becomes a curve of targets per level of perceived effort.
 * Advanced shows the curve itself for editing. Then the beep the timer plays.
 */
export const preferences = (el, state, reportError, factory) => {
    const tools = factory.tools(),
        effort = factory.effort(),
        conversions = factory.conversions(),
        preferenceStore = factory.store('preferences'),
        beep = factory.beep(),
        sounds = factory.sounds(),
        sections = [
            {id: 'heartRate', title: 'Heart rate', peak: 'Max heart rate',
                help: 'Your maximum heart rate, e.g. from a max heart rate test.'},
            {id: 'power', title: 'Power', peak: 'Ramp test max',
                help: 'Your best 1-minute power from a ramp test. FTP is about 75% of it.'},
            {id: 'speed', title: 'Speed', peak: 'Top speed',
                help: 'Your top speed in a flat-out test, holding one gear and trainer resistance.'},
        ],
        speedUnits = ['speedKmh', 'speedMph'];
    let prefs,
        container;

    const save = () => {
        preferenceStore.save(prefs).catch((error) => {
            reportError('Could not save preferences. ' + error);
        });
    };

    const section = (id) => {
        prefs[id] = prefs[id] || {};
        return prefs[id];
    };

    const hasCurve = (id) => Array.isArray(section(id).points);

    // the effort mode whose unit and bounds a section's values are in.
    const modeOf = (id) => effort.mode(id === 'speed' ? section('speed').unit || speedUnits[0] : id);

    const renderUnit = (s) => {
        const e = tools.escapeHtml;
        if (s.id !== 'speed') {
            return '';
        }
        return '<div class="field">' +
            '<label class="block-label" for="unit-speed">Unit</label>' +
            '<select id="unit-speed" class="input select preferences__unit">' +
                speedUnits.map((id) => '<option value="' + e(id) + '"' + (id === modeOf('speed').id ? ' selected' : '') +
                    '>' + e(effort.mode(id).unit) + '</option>').join('') +
            '</select>' +
        '</div>';
    };

    const renderNumber = (id, className, m, value, attrs) => {
        const e = tools.escapeHtml;
        return '<div class="effort-numeric">' +
            '<input type="number" inputmode="numeric" id="' + e(id) + '" class="input ' + className + '"' +
                ' min="' + m.min + '" max="' + m.max + '" value="' + (typeof(value) === 'number' ? value : '') + '"' +
                (attrs || '') + '>' +
            '<span class="effort-numeric__unit">' + e(m.unit) + '</span>' +
        '</div>';
    };

    const renderPeak = (s) => {
        const e = tools.escapeHtml,
            id = 'peak-' + s.id;
        return '<div class="field">' +
            '<label class="block-label" for="' + e(id) + '">' + e(s.peak) + '</label>' +
            renderNumber(id, 'preferences__peak', modeOf(s.id), hasCurve(s.id) ? section(s.id).points[9] : null,
                ' placeholder="' + e(modeOf(s.id).placeholder) + '"') +
        '</div>';
    };

    const renderCurve = (s) => {
        const e = tools.escapeHtml;
        return '<table class="curve">' +
            '<thead><tr><th scope="col">Perceived effort</th><th scope="col">Target</th></tr></thead>' +
            '<tbody>' + effort.mode('perceived').levels.map((level, index) => {
                const id = 'curve-' + s.id + '-' + index;
                return '<tr>' +
                    '<th scope="row"><label for="' + e(id) + '">' + e(level.label) + '</label></th>' +
                    '<td>' + renderNumber(id, 'preferences__point', modeOf(s.id), section(s.id).points[index],
                        ' data-index="' + index + '"') + '</td>' +
                '</tr>';
            }).join('') + '</tbody>' +
        '</table>';
    };

    // advanced needs a curve to edit, so it waits for a peak.
    const renderSection = (s) => {
        const e = tools.escapeHtml,
            advanced = hasCurve(s.id) && !!section(s.id).advanced;
        return '<section class="panel preferences__section" data-section="' + e(s.id) + '">' +
            '<div class="preferences__head">' +
                '<h2 class="panel__title">' + e(s.title) + '</h2>' +
                '<label class="switch">' +
                    '<input type="checkbox" class="switch__input preferences__advanced"' +
                        (advanced ? ' checked' : '') + (hasCurve(s.id) ? '' : ' disabled') + '>' +
                    '<span class="switch__label">Advanced</span>' +
                '</label>' +
            '</div>' +
            '<p class="muted preferences__help">' + e(s.help) + '</p>' +
            renderUnit(s) +
            (advanced ? renderCurve(s) : renderPeak(s)) +
        '</section>';
    };

    const renderBeep = () => {
        const e = tools.escapeHtml,
            chosen = sounds[prefs.beep] ? prefs.beep : 'softBlip';
        return '<section class="panel">' +
            '<h2 class="panel__title">Beep</h2>' +
            '<p class="muted preferences__help">The sound for the countdown, each new interval and the fanfare at the end.</p>' +
            '<div class="field">' +
                '<label class="block-label" for="beep-sound">Sound</label>' +
                '<select id="beep-sound" class="input select preferences__beep">' +
                    Object.entries(sounds).map(([id, sound]) => '<option value="' + e(id) + '"' +
                        (id === chosen ? ' selected' : '') + '>' + e(sound.name) + '</option>').join('') +
                '</select>' +
            '</div>' +
            '<label class="switch">' +
                '<input type="checkbox" class="switch__input preferences__fanfare"' + (prefs.skipFanfare ? ' checked' : '') + '>' +
                '<span class="switch__label">Skip fanfare</span>' +
            '</label>' +
        '</section>';
    };

    const render = () => {
        container.innerHTML = sections.map(renderSection).join('') + renderBeep();
    };

    const changePeak = (id, input) => {
        const m = modeOf(id),
            value = parseInt(input.value, 10);
        if (isNaN(value) || value <= 0) {
            delete section(id).points;
        } else {
            section(id).points = conversions.curveFromPeak(id, Math.min(m.max, Math.max(m.min, value)));
        }
        save();
        render();
    };

    // each target sits between its neighbours, so harder efforts never ask for less.
    const changePoint = (id, input) => {
        const m = modeOf(id),
            points = section(id).points,
            index = parseInt(input.getAttribute('data-index'), 10),
            value = parseInt(input.value, 10),
            low = index > 0 ? points[index - 1] : m.min,
            high = index < 9 ? points[index + 1] : m.max;
        if (!isNaN(value)) {
            points[index] = Math.min(high, Math.max(low, value));
            save();
        }
        input.value = points[index];
    };

    const changeAdvanced = (id, input) => {
        const s = section(id),
            fromPeak = conversions.curveFromPeak(id, s.points[9]);
        if (!input.checked && s.points.some((point, index) => point !== fromPeak[index]) &&
            !window.confirm('Your own targets will be replaced by ones worked out from the peak. Continue?')) {
            input.checked = true;
            return;
        }
        s.advanced = input.checked;
        if (!s.advanced) {
            s.points = fromPeak;
        }
        save();
        render();
    };

    // the targets stay the same speeds, just in the new unit.
    const changeUnit = (input) => {
        const s = section('speed'),
            from = modeOf('speed').id;
        // converted while the curve is still in the old unit.
        if (hasCurve('speed')) {
            s.points = s.points.map((point) => conversions.convert(from, input.value, point, prefs));
        }
        s.unit = input.value;
        save();
        render();
    };

    // plays the choice, so it can be heard before a workout.
    const changeBeep = (input) => {
        prefs.beep = input.value;
        save();
        beep.unlock();
        beep.use(prefs.beep);
        beep();
    };

    // turning it back on plays it, so it can be heard too.
    const changeFanfare = (input) => {
        prefs.skipFanfare = input.checked;
        save();
        if (!prefs.skipFanfare) {
            beep.unlock();
            beep.use(prefs.beep);
            beep.fanfare();
        }
    };

    const changed = (e) => {
        const target = e.target,
            item = target.closest('.preferences__section'),
            id = item && item.getAttribute('data-section');
        if (target.classList.contains('preferences__beep')) {
            changeBeep(target);
            return;
        }
        if (target.classList.contains('preferences__fanfare')) {
            changeFanfare(target);
            return;
        }
        if (!id) {
            return;
        }
        if (target.classList.contains('preferences__peak')) {
            changePeak(id, target);
        } else if (target.classList.contains('preferences__point')) {
            changePoint(id, target);
        } else if (target.classList.contains('preferences__advanced')) {
            changeAdvanced(id, target);
        } else if (target.classList.contains('preferences__unit')) {
            changeUnit(target);
        }
    };

    const teardown = () => {
        el.style.display = '';
        el.removeEventListener('change', changed);
    };

    const setup = async () => {
        container = el.querySelector('.preferences__sections');
        prefs = await preferenceStore.get();
        render();
        el.addEventListener('change', changed);
        el.style.display = 'block';
    };

    return {
        teardown: teardown,
        setup: setup,
    };
};
