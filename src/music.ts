export type Pitch = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type Octave = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type Duration = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type Note = number

export type Line = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type Clef = 1 | 2

export type Accidental = 1 | 2

const pitches = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const octaves = ['0', '1', '2', '3', '4', '5', '6']
const durations = ['W', 'w', 'h', 'q', 'e', 'x', 't', 'T']
const clefs = ['g', 'b']
const accidentals = ['#', 'f']

const pitch_mask =      0x00000f
const octave_mask =     0x0000f0
const duration_mask =   0x000f00
const accidental_mask = 0x00f000

export function make_note(pitch: Pitch, octave: Octave, duration: Duration, accidental?: Accidental) {
  return pitch & octave << 1 & duration << 2  & (accidental || 0) << 3
}

export function note_pitch(note: Note): Pitch {
  return (note & pitch_mask) as Pitch
}

export function note_octave(note: Note): Octave {
  return (note & octave_mask >> 1) as Octave
}

export function note_duration(note: Note): Duration {
  return (note & duration_mask >> 2) as Duration
}

export function note_accidental(note: Note): Accidental | undefined {
  return (note & accidental_mask >> 3) as Accidental
}

export function uci_note(uci: string): Note | undefined {

  if (uci.length < 2) {
    return undefined
  }
  let pitch: Pitch | undefined,
  octave: Octave | undefined,
  duration: Duration | undefined,
  accidental: Accidental | undefined

  if (uci.length === 2) {
    duration = 4
  }

  pitch = uci_pitch(uci[0])
  octave = uci_octave(uci[1])

  accidental = uci_accidental(uci[2])
  if (!accidental) {
    duration = uci_duration(uci[2])
  } else {
    duration = uci_duration(uci[3])
  }

  if (pitch && octave && duration) {
    return make_note(pitch, octave, duration, accidental)
  }
}

function uci_pitch(pitch: string) {
  let i = pitches.indexOf(pitch)
  if (i !== -1) return i + 1 as Pitch
}

function uci_octave(octave: string) {
  let i = octaves.indexOf(octave)
  if (i !== -1) return i + 1 as Octave
}

function uci_duration(duration: string) {
  let i = durations.indexOf(duration)
  if (i !== -1) return i + 1 as Duration
}

function uci_accidental(accidental: string) {
  let i = accidentals.indexOf(accidental)
  if (i !== -1) return i + 1 as Accidental
}
