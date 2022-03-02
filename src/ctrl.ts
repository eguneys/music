import { ticks } from './shared'
import * as util from './util'
import { Clef, Pitch, Octave, Duration, Tempo, TimeSignature } from './music'
import { make_note, make_time_signature, is_tempo, is_note, is_rest } from './music'
import { note_pitch, note_octave, note_duration } from './music'

import { Config } from './config'
import Input from './input'

import { FreeOnStaff } from './types'

import { Staff, Measure, Nore } from './music'
import { make_measure } from './music'

export type Redraw = () => void


let btn_pitches = [' ', 'j', 'k', 'l', ';', '\'', '\\']
let btn_pitches_octave_up = ['a', 's', 'd', 'f', 'g', 'h']

const tempos = [10, 60, 80, 90, 120, 168, 200, 400]

type Voice = {
  key: string,
  time: number 
}


const duration_codes = ['double_note', 'whole_note', 'half_note', 'quarter_note', 'quarter_note', 'quarter_note', 'quarter_note', 'quarter_note']
function note_duration_code(duration: Duration) {
  return duration_codes[duration - 1]
}

const duration_flag_codes = [undefined, undefined, undefined, undefined, 1, 2, 3, 4]
function note_duration_flag(duration: Duration) {
  return duration_flag_codes[duration - 1]
}

export default class Ctrl {

  // properties
  tempo: Tempo

  voices: Array<Voice> = []

  measure_index: number = 0
  beat_index: number = 0

  get bpm() {
    return tempos[this.tempo - 1]
  }

  get beat_duration() {
    return (1/this.bpm) * (ticks.seconds * 60)
  }

  get frees(): Array<FreeOnStaff> {
    let res = []

    let { clef, time, measures } = this.staff

    res.push({
      code: 'gclef',
      klass: '',
      pitch: 5 as Pitch,
      octave: 4 as Octave,
      ox: 0.2,
      oy: 0
    })

    res.push({
      code: 'two_time',
      klass: '',
      pitch: 5 as Pitch,
      octave: 4 as Octave,
      ox: 1,
      oy: 0
    })


    res.push({
      code: 'four_time',
      klass: '',
      pitch: 2 as Pitch,
      octave: 5 as Octave,
      ox: 1,
      oy: 0
    })


    measures.forEach(measure => {
      let { nores } = measure

      let ox = 1
      nores.forEach(nore => {
        if (is_rest(nore)) {

          ox += 1
          res.push({
            code: 'half_rest',
            klass: '',
            pitch: 7 as Pitch,
            octave: 4 as Octave,
            ox,
            oy: 0
          })
        } else {

          let pitch = note_pitch(nore),
            octave = note_octave(nore),
            duration = note_duration(nore)

          let code = note_duration_code(duration)

          ox += 1


          let flag = note_duration_flag(duration)
          let stem = {
            direction: 1,
            flag
          }

          res.push({
            code,
            klass: '',
            pitch,
            octave,
            ox,
            oy: 0,
            stem
          })
        }
      })
    })


    return res
  }

  staff: Staff

  _schedule_redraw: boolean = true

  constructor(readonly input: Input, 
    readonly config: Config, 
    readonly _redraw: Redraw) {

    this.tempo = 3

    let time = make_time_signature(4, 2)
    this.staff = {
      clef: 1,
      time,
      measures: [make_measure(time)]
    }
  }

  redraw() {
   this._schedule_redraw = true 
  }

  update(dt: number, dt0: number) {


    let rest = true


    this.voices.forEach(voice => {
      voice.time += dt


      let play_duration: Duration | undefined
      if (voice.time >= this.beat_duration) {

        play_duration = 3
      } else if (voice.time >= this.beat_duration / 2) {

        play_duration = 4
      } else if (voice.time >= this.beat_duration / 4) {
        play_duration = 5
      }

      if (play_duration) {
        let { key } = voice
        let _btns = btn_pitches.includes(key) ? btn_pitches : btn_pitches_octave_up

        let pitch = _btns.indexOf(key) + 1 as Pitch,
        octave = (_btns === btn_pitches ? 4 : 5) as Octave

        let { nores } = this.staff.measures[this.measure_index]
        nores[this.beat_index] = make_note(pitch, octave, play_duration)

        rest = false
        this.redraw()
      }
    })

    if (rest) {
      let { nores } = this.staff.measures[this.measure_index]
      nores[this.beat_index] = 3
      this.redraw()
    }

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
        if (this.voices.length === 0) {
          this.voices.push({
            key,
            time: dt
          })
          this.redraw()
        }
      } else if (x < 0) {
        if (x0 > 0) {
          this.voices = this.voices.filter(_ => _.key!== key)
          this.redraw()
        }
      }
    })

    btn_pitches.forEach((key, i) => {
      let x = this.input.btn(key),
        x0 = this.input.btn0(key)

      if (x > 0) {
        if (this.voices.length === 0) {
          this.voices.push({
            key,
            time: dt 
          })
          this.redraw()
        }
      } else if (x < 0) {
        if (x0 > 0) {
          this.voices = this.voices.filter(_ => _.key!== key)
          this.redraw()
        }
      }
    })

    if (this._schedule_redraw) {
      this._schedule_redraw = false
      this._redraw()
    }
  }

}
