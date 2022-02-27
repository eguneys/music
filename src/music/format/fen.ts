import { uci_note, uci_clef } from '../types'
import { Staff, Notations } from '../types'

export type Fen = string

export type Music = Staff | [Staff, Staff]

// gclef 'G'g4 'A'a4/'F'f4 'B'b4/'E'e4 'C'c5/'D'd4 'D'd5 'E'e5 'F'f5 'G'g5
//

// brace\n
// gclef 'G'g4 'A'a4/'F'f4 'B'b4/'E'e4 'C'c5/'D'd4 'D'd5 'E'e5 'F'f5 'G'g5\n
// bclef 'G'g4 'A'a4/'F'f4 'B'b4/'E'e4 'C'c5/'D'd4 'D'd5 'E'e5 'F'f5 'G'g5

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

  let notes: Array<Notations> = _notes.flatMap(_ => {
    let res = read_notation(_)
    return !res ? [] : [res]
  })

  if (clef) {
    return {
      clef,
      notes
    }
  }
}

export function read_notation(notation: string): Notations {
  let n = notation[0]

  return notation.split('/').flatMap(n => {
    let res = n.match(/'([a-zA-Z0-9]*)'(.*)$/)
    if (!res) {
      let note = uci_note(n)
      if (note) {
        return note
      }
      return []
    }

    let [_, text, _note] = res

    let note = uci_note(_note)
    if (note) {
      return { text, note }
    }
    return []
  })
}
