const pitches = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const octaves = ['0', '1', '2', '3', '4', '5', '6'];
const durations = ['W', 'w', 'h', 'q', 'e', 'x', 't', 'T'];
const clefs = ['gclef', 'bclef'];
const accidentals = ['#', 'f'];
const bar_lines = ['dbarline', 'barline'];
const pitch_mask = 0x0000000f;
const octave_mask = 0x000000f0;
const duration_mask = 0x00000f00;
const accidental_mask = 0x0000f000;
export function make_note(pitch, octave, duration, accidental) {
    return pitch | (octave << 4) | (duration << 8) | ((accidental || 0) << 12);
}
export function note_pitch(note) {
    return (note & pitch_mask);
}
export function note_octave(note) {
    return (note & octave_mask) >> 4;
}
export function note_duration(note) {
    return (note & duration_mask) >> 8;
}
export function note_accidental(note) {
    return (note & accidental_mask) >> 12;
}
// C4 -> 1 5 -> 1
// B4 -> 7 5 -> 7
// C5 -> 1 6 -> 8
let line_test = [['C4', 1],
    ['D4', 2],
    ['B4', 7],
    ['C5', 8],
    ['B5', 14]];
/*
line_test.map(([note, res]) =>
              console.log(note, note_line(uci_note(note)), res))

             */
export function note_line(clef, note) {
    let pitch = note_pitch(note), octave = note_octave(note);
    if (clef === 1) {
        return (octave - 6) * 7 + pitch + 7;
    }
    else {
        return (octave - 4) * 7 + pitch + 5;
    }
}
export function uci_note(uci) {
    if (uci.length < 2) {
        return undefined;
    }
    let pitch, octave, duration, accidental;
    pitch = uci_pitch(uci[0]);
    octave = uci_octave(uci[1]);
    if (uci.length === 2) {
        if (pitch && octave) {
            return make_note(pitch, octave, 4);
        }
        else {
            return;
        }
    }
    accidental = uci_accidental(uci[2]);
    if (!accidental) {
        duration = uci_duration(uci[2]);
    }
    else {
        duration = uci_duration(uci[3]);
    }
    if (pitch && octave && duration) {
        return make_note(pitch, octave, duration, accidental);
    }
}
function uci_pitch(pitch) {
    let i = pitches.indexOf(pitch);
    if (i !== -1)
        return i + 1;
}
function uci_octave(octave) {
    let i = octaves.indexOf(octave);
    if (i !== -1)
        return i + 1;
}
function uci_duration(duration) {
    let i = durations.indexOf(duration);
    if (i !== -1)
        return i + 1;
}
function uci_accidental(accidental) {
    let i = accidentals.indexOf(accidental);
    if (i !== -1)
        return i + 1;
}
export function uci_clef(clef) {
    let i = clefs.indexOf(clef);
    if (i !== -1)
        return i + 1;
}
export function make_time_signature(nb_note_value, note_value) {
    return nb_note_value * 32 + note_value;
}
export function time_nb_note_value(signature) {
    return Math.floor(signature / 32);
}
export function time_note_value(signature) {
    return signature % 32;
}
const nb_note_values = [2, 3, 4, 6, 9, 12];
const note_values = [2, 4, 8, 16];
export function uci_nb_note_value(nb_note_value) {
    if (nb_note_values.includes(nb_note_value)) {
        return nb_note_value;
    }
}
export function uci_note_value(note_value) {
    if (note_values.includes(note_value)) {
        return note_value;
    }
}
