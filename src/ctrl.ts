import * as util from './util'
import { Clef, Pitch, Octave, Duration, Tempo, TimeSignature } from './music'
import { make_time_signature, is_tempo } from './music'

import { Config } from './config'
import Input from './input'

import { FreeOnStaff } from './types'

import { Staff, Measure, Nore } from './music'
import { make_measure } from './music'

export type Redraw = () => void


let btn_pitches = [' ', 'j', 'k', 'l', ';', '\'', '\\']
let btn_pitches_octave_up = ['a', 's', 'd', 'f', 'g', 'h']


export default class Ctrl {


  tempo?: Tempo


  get frees(): Array<FreeOnStaff> {
    let res = []

    let { clef, time_signature, measures } = this.staff

    res.push({
      code: 'gclef',
      klass: '',
      pitch: 5 as Pitch,
      octave: 4 as Octave,
      ox: 0.2,
      oy: 0
    })



    return res
  }

  staff: Staff

  constructor(readonly input: Input, 
    readonly config: Config, 
    readonly _redraw: Redraw) {

    if (config.capture) {
      this.tempo = 3
    }

    let time = make_time_signature(2, 4)
    this.staff = {
      clef: 1,
      time,
      measures: [make_measure(time)]
    }
  }
  update(dt: number, dt0: number) {

    if (this.tempo) {
      if (this.input.btnp('+')) {
        let new_tempo = this.tempo + 1

        if (is_tempo(new_tempo)) {
          this.tempo = new_tempo
        }
      } else if (this.input.btnp('-')) {
        let new_tempo = this.tempo - 1
        if (is_tempo(new_tempo)) {
          this.tempo = new_tempo
        }
      }
    }

    btn_pitches_octave_up.forEach((key, i) => {
      let x = this.input.btn(key),
        x0 = this.input.btn0(key)

      if (x > 0) {
      } else if (x < 0) {
        if (x0 > 0) {
          let pitch = (i + 1) as Pitch,
            octave = 5 as Octave,
            duration = Math.floor(x0 / 200) as Duration
        }
      }
    })

    btn_pitches.forEach((key, i) => {
      let x = this.input.btn(key),
        x0 = this.input.btn0(key)

      if (x > 0) {
      } else if (x < 0) {
        if (x0 > 0) {
          let pitch = (i + 1) as Pitch,
            octave = 4 as Octave,
            duration = Math.floor(x0 / 200) as Duration
        }
      }
    })
  }

}
