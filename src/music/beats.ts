import { Note, Rest } from './types'

export type Beat = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12
export type Measure = number
export type BeatQuanti = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
export type BeatMeasure = number

export function make_bm(measure: Measure, beat: Beat, quanti: BeatQuanti, nb_beats: number) {
  return (measure * nb_beats + beat) * 8 + quanti
}

export function bm_measure(bm: BeatMeasure, nb_beats: number): Measure {
  return Math.floor(Math.floor(bm / 8) / nb_beats) as Measure
}

export function bm_beat(bm: BeatMeasure, nb_beats: number): Beat {
  return Math.floor(bm / 8) % nb_beats as Beat
}

export function bm_quanti(bm: BeatMeasure): BeatQuanti {
  return bm % 8 as BeatQuanti
}


export type NoteRest = Note | Rest

export type BeatMeasureNoteRest = number

const bm_mask =   0xffff0000
const nore_mask = 0x0000ffff

export function make_bmnr(bm: BeatMeasure, nr: NoteRest) {
  return (bm << 16) | nr
}

export function bmnr_bm(bmnr: BeatMeasureNoteRest) {
  return (bmnr & bm_mask) >> 16
}

export function bmnr_nr(bmnr: BeatMeasureNoteRest) {
  return bmnr & nore_mask
}
