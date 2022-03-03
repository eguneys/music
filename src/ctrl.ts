import { ticks } from './shared'
import * as util from './util'
import { Clef, Pitch, Octave, Duration, Tempo, TimeSignature } from './music'
import { make_note, make_time_signature, is_tempo, is_note, is_rest } from './music'
import { note_pitch, note_octave, note_duration } from './music'
import { time_nb_note_value } from './music'

import { Beat, Measure, BeatQuanti, BeatMeasure } from './music'
import { bm_beat, bm_quanti, bm_measure, make_bm } from './music'

import { Config } from './config'
import Input from './input'

import { FreeOnStaff } from './types'

export type Redraw = () => void


let btn_pitches = [' ', 'j', 'k', 'l', ';', '\'', '\\']
let btn_pitches_octave_up = ['a', 's', 'd', 'f', 'g', 'h']

let btn_pitches_all = [...btn_pitches, ...btn_pitches_octave_up]


// TODO GC
function voice_pitch_octave(voice: Voice) {
  let { key } = voice
  let pitch = btn_pitches.indexOf(key) + 1
  if (pitch > 0) {
    return [pitch, 4]
  }
  pitch = btn_pitches_octave_up.indexOf(key) + 1
  if (pitch > 0) {
    return [pitch, 5]
  }
}


const tempos = [10, 60, 80, 90, 120, 168, 200, 400]

type Voice = {
  key: string,
  start: BeatMeasure,
  end?: BeatMeasure
}

function how_many_beats(start: BeatMeasure, end: BeatMeasure, nb_beats: number) {
  return bm_beat(end - start, nb_beats)
}

function how_many_quantis(start: BeatMeasure, end: BeatMeasure) {
  return bm_quanti(end - start)
}

const metronome_key = 'metronome_key'

const duration_codes = ['double_note', 'whole_note', 'half_note', 'quarter_note', 'quarter_note', 'quarter_note', 'quarter_note', 'quarter_note']
function note_duration_code(duration: Duration) {
  return duration_codes[duration - 1]
}

const duration_flag_codes = [undefined, undefined, undefined, undefined, 1, 2, 3, 4]
function note_duration_flag(duration: Duration) {
  return duration_flag_codes[duration - 1]
}

type Context = {
  input: Input
}

abstract class IPlay {

  _schedule_redraw = true

  data: any

  get input() { return this.ctx.input }
  constructor(readonly ctx: Context) {}


  _set_data(data: any) {
    this.data = data
    return this
  }

  init(): this {
    this._init()
    return this
  }

  redraw() {
    this._schedule_redraw = true
  }

  update(dt: number, dt0: number) {
    this._update(dt, dt0)
  }

  abstract _init(): void;
  abstract _update(dt: number, dt0: number): void;
}




export class Playback extends IPlay {


  get bpm() {
    return tempos[this.tempo - 1]
  }

  get beat_duration() {
    return (1/this.bpm) * (ticks.seconds * 60)
  }

  get quanti_duration() {
    return this.beat_duration / 8
  }

  get beats_per_measure() {
    return time_nb_note_value(this.time_signature)
  }


  get time_signature(): TimeSignature { return this.data as TimeSignature }

  get current_measure(): Measure {
    return bm_measure(this.bm, this.beats_per_measure)
  }

  get current_beat(): Beat {
    return bm_beat(this.bm, this.beats_per_measure)
  }

  measure0?: Measure
  beat0?: Beat

  t_quanti: number = 0

  playing: boolean = false


  bm!: BeatMeasure
  repeat?: [BeatMeasure, BeatMeasure]

  tempo: Tempo = 3

  voices!: Array<Voice>

  _init() {
    this.bm = 0
    this.voices = []
    this.playing = true

    this.repeat = [0, make_bm(1, 0, 0, this.beats_per_measure)]
  }

  _update(dt: number, dt0: number) {
    this.t_quanti += dt


    if (this.t_quanti >= this.quanti_duration) {
      this.t_quanti = 0
      this.bm++;

      if (this.repeat) {
        if (this.bm >= this.repeat[1]) {
          this.bm = this.repeat[0]
        }
      }
    }

    if (this.beat0 !== this.current_beat) {
      /*
      this.history.get(this.bm, []).push({ key: metronome_key, start: this.bm, end: this.bm + 4 })
      this.redraw()
     */
    }

    /*
    if (this.current_measure > 1) {
      this.history.remove_measure(this.current_measure - 1)
      this.current_measure = 1
      this.redraw()
    }
   */

  btn_pitches_all.forEach((key, i) => {
    let x = this.input.btn(key),
      x0 = this.input.btn0(key)

    if (x > 0) {
      if (x0 === 0) {
        /*
        this.voices.push({
          key,
          start: this.bm
        })
        this.redraw()
       */
      }
    } else if (x < 0) {
      if (x0 > 0) {
        /*
        let voice = this.voices.find(_ => _.key)

        if (voice) {
          // TODO GC
          this.history.get(this.bm, []).push(voice)
          this.voices.splice(this.voices.indexOf(voice), 1)
          this.redraw()
        }
       */
      }
    }
  })

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

    this.beat0 = this.current_beat
    this.measure0 = this.current_measure

  }
}
export default class Ctrl extends IPlay {

  // properties
  playback!: Playback

  get frees(): Array<FreeOnStaff> {
    let res = []

    res.push({ code: 'gclef', klass: '', pitch: 5 as Pitch, octave: 4 as Octave, ox: 0.2, oy: 0 })
    res.push({ code: 'two_time', klass: '', pitch: 5 as Pitch, octave: 4 as Octave, ox: 1, oy: 0 })
    res.push({ code: 'four_time', klass: '', pitch: 2 as Pitch, octave: 5 as Octave, ox: 1, oy: 0 })

    /*
    let beats_quantis_voices = this.playback.history
    .get_measure(this.playback.current_measure)

    beats_quantis_voices.forEach((quantis_voices, beat_i) => {
      let _ox = 2 + beat_i

      let rest = true

      quantis_voices.forEach(voices => {
        voices.forEach(voice => {
          let nb_quantis = how_many_quantis(voice.start, voice.end || this.playback.bm) 

          let ox = _ox
          let duration_ratio = nb_quantis * this.playback.quanti_duration / this.playback.beat_duration
          let duration: Duration | undefined
          if (duration_ratio >= 1) {
            duration = 2
          } else if (duration_ratio >= 1/2) {
            duration = 3
          } else if (duration_ratio >= 1/4) {
            duration = 4
          }

          if (duration) {
            if (voice.key === metronome_key) {
              res.push({ code: 'half_note', klass: '.metronome', pitch: 2, octave: 5, ox, oy: 0 })
              return
            }
            rest = false
            let po = voice_pitch_octave(voice)
            if (po) {
              let code = note_duration_code(duration)
              res.push({ code, klass: '', pitch: po[0], octave: po[1], ox, oy: 0 })
            }
          }
        })
      })

      let ox = _ox
      if (rest) {
        res.push({ code: 'half_rest', klass: '', pitch: 7 as Pitch, octave: 4 as Octave, ox, oy: 0 })
      }


    })

   */

    return res
  }


  _init() {
    let time = make_time_signature(4, 2)
    this.playback = new Playback(this.ctx)._set_data(time).init()
  }

  _update(dt: number, dt0: number) {
  
    this.playback.update(dt, dt0)

    this._schedule_redraw = this.playback._schedule_redraw
  }
}
