import { uci_note, uci_clef } from '../types'
import { make_time_signature } from '../types'
import { Staff, TimeSignature } from '../types'

export type Fen = string

export type Music = Staff | [Staff, Staff]

// gclef 'G'g4 'A'a4/'F'f4 'B'b4/'E'e4 'C'c5/'D'd4 'D'd5 'E'e5 'F'f5 'G'g5
//

// brace\n
// gclef 'G'g4 'A'a4/'F'f4 'B'b4/'E'e4 'C'c5/'D'd4 'D'd5 'E'e5 'F'f5 'G'g5\n
// bclef 'G'g4 'A'a4/'F'f4 'B'b4/'E'e4 'C'c5/'D'd4 'D'd5 'E'e5 'F'f5 'G'g5
// 
// gclef 2/4 'G'g4 'A'a4/'F'f4 'B'b4/'E'e4 'C'c5/'D'd4 'D'd5 'E'e5 'F'f5 'G'g5
//

export function fen_music(fen: Fen): Music | undefined {
  let staff = fen.split('\n')

  if (staff[0] === 'brace') {
    let s1 = fen_staff(staff[1]),
      s2 = fen_staff(staff[2])
    if (s1 && s2) {
      return [s1, s2]
    }
  } else {
    return fen_staff(fen)
  }
}

export function fen_staff(fen: string): Staff | undefined {
  let [_clef, ..._notes] = fen.split(' ')

  let clef = uci_clef(_clef)

  let time = read_time(_notes[0])

  if (time) { _notes.splice(0, 1) }

  if (clef) {
    return {
      clef,
      time: time || 4,
      measures: []
    }
  }
}

export function read_time(time: string): TimeSignature | undefined {
  return undefined
  /*
  let [_nb_note_value, _note_value] = time.split('/')

  let nb_note_value = uci_nb_note_value(parseInt(_nb_note_value)),
    note_value = uci_note_value(parseInt(_note_value))

  if (nb_note_value && note_value) {
    return make_time_signature(nb_note_value, note_value)
  }
   */
}

