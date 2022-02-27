export type Pitch = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type Octave = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type Duration = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type Accidental = 1 | 2

export type Note = number

export type Line = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

export type Clef = 1 | 2

export type BarLine = 1 | 2

export type Text = string

export type Notation = {
  text: Text,
  note: Note
}

export type Notations = Notation | Array<Notation>

export type Staff = {
  clef: Clef,
  notes: Array<Notations>
}

const pitches = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const octaves = ['0', '1', '2', '3', '4', '5', '6']
const durations = ['W', 'w', 'h', 'q', 'e', 'x', 't', 'T']
const clefs = ['gclef', 'bclef']
const accidentals = ['#', 'f']

const bar_lines = ['dbarline', 'barline']

const pitch_mask =      0x0000000f
const octave_mask =     0x000000f0
const duration_mask =   0x00000f00
const accidental_mask = 0x0000f000

export function make_note(pitch: Pitch, octave: Octave, duration: Duration, accidental?: Accidental) {
  return pitch | (octave << 4) | (duration << 8) | ((accidental || 0) << 12)
}

export function note_pitch(note: Note): Pitch {
  return (note & pitch_mask) as Pitch
}

export function note_octave(note: Note): Octave {
  return (note & octave_mask) >> 4 as Octave
}

export function note_duration(note: Note): Duration {
  return (note & duration_mask) >> 8 as Duration
}

export function note_accidental(note: Note): Accidental | undefined {
  return (note & accidental_mask) >> 12 as Accidental
}



// C4 -> 1 5 -> 1
// B4 -> 7 5 -> 7
// C5 -> 1 6 -> 8

let line_test = 
  [['C4', 1],
    ['D4', 2], 
    ['B4', 7], 
    ['C5', 8], 
    ['B5', 14]]
/*
line_test.map(([note, res]) =>
              console.log(note, note_line(uci_note(note)), res))

             */
export function note_line(clef: Clef, note: Note): Line {

  let pitch = note_pitch(note),
    octave = note_octave(note)
  if (clef === 1) {
    return (octave - 6) * 7 + pitch + 7 as Line
  } else {
    return (octave - 4) * 7 + pitch + 5 as Line
  }
}


export function uci_note(uci: string): Note | undefined {

  if (uci.length < 2) {
    return undefined
  }
  let pitch: Pitch | undefined,
  octave: Octave | undefined,
  duration: Duration | undefined,
  accidental: Accidental | undefined

  pitch = uci_pitch(uci[0])
  octave = uci_octave(uci[1])


  if (uci.length === 2) {
    if (pitch && octave) {
      return make_note(pitch, octave, 4)
    } else {
      return
    }
  }

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


export function uci_clef(clef: string) {
  let i = clefs.indexOf(clef)
  if (i !== -1) return i + 1 as Clef
}
