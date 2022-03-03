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


