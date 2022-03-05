import { Pitch, Octave } from './music'

export type Code = string
export type Direction = 1 | -1

export type Stem = {
  direction: Direction,
  flag?: number,
  beam?: Beam
}

export type Beam = {
  orig: FreeOnStaff,
  between: Array<FreeOnStaff>,
  dest: FreeOnStaff
}

export type Barline = {
  ox: number
}

export type Tie = {
  orig: FreeOnStaff,
  dest: FreeOnStaff,
  direction: Direction
}

export type FreeOnStaff = {
  code: Code,
  klass: string,
  pitch: Pitch,
  octave: Octave,
  ox: number,
  oy: number,
  stem?: Stem,
}


