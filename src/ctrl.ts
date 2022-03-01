import * as util from './util'
import { Clef, Pitch, Octave, Duration, Tempo, TimeSignature } from './music'
import { make_time_signature, is_tempo } from './music'

import { Config } from './config'
import Input from './input'

import { FreeOnStaff } from './types'

export type Redraw = () => void


let btn_pitches = [' ', 'j', 'k', 'l', ';', '\'', '\\']
let btn_pitches_octave_up = ['a', 's', 'd', 'f', 'g', 'h']


export default class Ctrl {


  tempo?: Tempo
  frees: Array<FreeOnStaff>
  last_note?: FreeOnStaff

  _schedule_redraw = true

  constructor(readonly input: Input, 
    readonly config: Config, 
    readonly _redraw: Redraw) {

    this.frees = config.frees || []

    if (config.capture) {
      this.add_clef(1)
      this.add_time_signature(make_time_signature(2, 4))
      this.add_tempo(3)
    }
  }

  redraw() {
    this._schedule_redraw = true
  }

  update(dt: number, dt0: number) {

    if (this.tempo) {
      if (this.input.btnp('+')) {
        let new_tempo = this.tempo + 1

        if (is_tempo(new_tempo)) {
          this.tempo = new_tempo
          this.redraw()
        }
      } else if (this.input.btnp('-')) {
        let new_tempo = this.tempo - 1
        if (is_tempo(new_tempo)) {
          this.tempo = new_tempo
          this.redraw()
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
          this.replaceNote(pitch, octave, duration)
          this.redraw()
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
          this.replaceNote(pitch, octave, duration)
          this.redraw()
        }
      }
    })

    if (this._schedule_redraw) {
      this._schedule_redraw = false
      this._redraw()
    }
  }

  add_tempo(tempo: Tempo) {
    this.tempo = tempo
  }

  add_time_signature(time_signature: TimeSignature) {
    this.frees.push({
      code: 'two_time',
      klass: '',
      pitch: 2,
      octave: 5,
      ox: 1,
      oy: 0
    })
    this.frees.push({
      code: 'four_time',
      klass: '',
      pitch: 5,
      octave: 4,
      ox: 1,
      oy: 0
    })

  }

  add_clef(clef: Clef) {
    this.frees.push({
      code: 'gclef',
      klass: '',
      pitch: 5,
      octave: 4,
      ox: 0.25,
      oy: 0
    })
  }

  replaceNote(pitch: Pitch, octave: Octave, duration: Duration) {
    if (this.last_note) {
      this.frees.pop()
    }
    this.last_note = {
      code: 'whole_note',
      klass: '',
      pitch,
      octave,
      ox: 2,
      oy: 0
    }
    this.frees.push(this.last_note)
  }


}
