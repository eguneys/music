import { ticks } from './shared'
import * as util from './util'
import { Clef, Pitch, Octave, Duration, Tempo, TimeSignature } from './music'
import { make_note, make_time_signature, is_tempo, is_note, is_rest } from './music'
import { Note, note_pitch, note_octave, note_duration } from './music'
import { time_nb_note_value, time_note_value } from './music'

import { Beat, Measure, BeatQuanti, BeatMeasure } from './music'
import { bm_beat, bm_quanti, bm_measure, make_bm } from './music'
import { BeatMeasureNoteRest, make_bmnr, bmnr_bm, bmnr_nr } from './music'

import { Config } from './config'
import Input from './input'

import { FreeOnStaff } from './types'

import { PlayerController } from './audio/player'

export type Redraw = () => void

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




let btn_pitches = [' ', 'j', 'k', 'l', ';', '\'', '\\']
let btn_pitches_octave_up = ['a', 's', 'd', 'f', 'g', 'h']
let btn_rest = 'Backspace'

let btn_pitches_all = [...btn_pitches, ...btn_pitches_octave_up, btn_rest]


// TODO GC
function voice_pitch_octave(voice: Voice): [Pitch, Octave] | undefined {
  let { key } = voice
  let pitch = btn_pitches.indexOf(key) + 1
  if (pitch > 0) {
    return [pitch, 4] as [Pitch, Octave]
  }
  pitch = btn_pitches_octave_up.indexOf(key) + 1
  if (pitch > 0) {
    return [pitch, 5] as [Pitch, Octave]
  }
}


const tempos = [10, 60, 80, 90, 120, 168, 200, 400]

type Voice = {
  key: string,
  instrument_id?: number,
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

const duration_codes = ['double', 'whole', 'half', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter']
function note_duration_code(duration: Duration) {
  return duration_codes[duration - 1] + '_note'
}

const rest_codes = ['double', 'whole', 'half', 'quarter', 'eighth', 'sixteenth', 'thirtysecond', 'sixtyfourth', 'onetwentyeighth']
function rest_duration_code(duration: Duration) {
  return rest_codes[duration - 1] + '_rest'
}

const duration_flag_codes = [undefined, undefined, undefined, undefined, 1, 2, 3, 4]
function note_duration_flag(duration: Duration) {
  return duration_flag_codes[duration - 1]
}

export class BeatDivido {

  bmnrs: Array<BeatMeasureNoteRest> = []

  get nb_beats() {
    return time_nb_note_value(this.time_signature)
  }

  get note_value() {
    return time_note_value(this.time_signature)
  }

  get min_note_value() {
    return 8
  }

  get min_quanti() {
    return Math.max(1, Math.pow(2, this.note_value - this.min_note_value) * 8)
  }

  // TODO GC
  get sub_quanties_for_note_values() {
    let res: Array<BeatQuanti> = []
    for (let i = this.note_value; i < this.min_note_value; i++) {
      res.push(Math.max(1, Math.pow(2, this.note_value - i) * 8) as BeatQuanti)
    }
    return res
  }

  constructor(readonly time_signature: TimeSignature) {}


  /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log */
  quanti_note_value(quanti: BeatQuanti): Duration {
    return this.note_value - Math.log(quanti / 8) / Math.log(2) as Duration
  }


  quanti_in_subs(quanti: BeatQuanti) {
    return this.sub_quanties_for_note_values.reduce(([left, acc], sub_quanti) => {
      let res = Math.floor(left / sub_quanti)
      acc.push(res)
      return [left - res * sub_quanti, acc] as [BeatQuanti, Array<number>]
    }, [quanti, []] as [BeatQuanti, Array<number>])

  }

  add_note(bm: BeatMeasure, nb_quanti: BeatQuanti, po?: [Pitch, Octave]) {
    let measure = bm_measure(bm, this.nb_beats),
      beat = bm_beat(bm, this.nb_beats),
      quanti = bm_quanti(bm)

    if (nb_quanti === 0) {
      return
    }

    let [quantized_left, quantized_subs] = this.quanti_in_subs(nb_quanti)

    nb_quanti = nb_quanti - quantized_left as BeatQuanti
    let note_duration = this.quanti_note_value(nb_quanti)

    let start_quanti = beat * 8 + quanti,
      end_quanti = start_quanti + nb_quanti

    let start_i,
      end_i
    let i_quanti = 0

    let off_start = 0,
    off_end = 0

    for (let i = 0; i < this.bmnrs.length; i++) {

      let bmnr = this.bmnrs[i]
      let _bm = bmnr_bm(bmnr)

      if (start_i === undefined) {

        if (i_quanti <= start_quanti && start_quanti < i_quanti+_bm) {
          off_start = start_quanti - i_quanti
          start_i = i
        }
      } 
      if (end_i === undefined) {
        if (i_quanti <= end_quanti && end_quanti <= i_quanti + _bm) {
          off_end = i_quanti + _bm - end_quanti
          end_i = i
          break
        }
      }

      i_quanti += _bm
    }

    if (start_i !== undefined && end_i !== undefined) {
      let [left, subs] = this.quanti_in_subs(off_start as BeatQuanti)
      let [end_left, end_subs] = this.quanti_in_subs(off_end + left as BeatQuanti)

      let b_notes = subs
      .flatMap((_, i) => [...Array(_)]
               .map(() =>
                    make_bmnr(
                      this.sub_quanties_for_note_values[i],
                      this.quanti_note_value(this.sub_quanties_for_note_values[i])))
              )

      let e_notes = end_subs
      .flatMap((_, i) => [...Array(_)]
               .map(() =>
                    make_bmnr(
                      this.sub_quanties_for_note_values[i],
                      this.quanti_note_value(this.sub_quanties_for_note_values[i]))))

      let i_bmnr = make_bmnr(nb_quanti, po?make_note(po[0], po[1], note_duration):note_duration)
      let removed = this.bmnrs.splice(start_i, end_i - start_i + 1, ...b_notes, i_bmnr, ...e_notes)

      return true
    }

    return false
  }

  add_measure() {
    [...Array(this.nb_beats)].forEach(_ => 
      this.bmnrs.push(make_bmnr(make_bm(0, 1, 0, this.nb_beats), this.note_value)))
  }

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

  get schedule_next_time(): number {
    return this.instrument.currentTime
  }

  measure0?: Measure
  beat0?: Beat

  t_quanti: number = 0

  playing: boolean = false


  bm!: BeatMeasure
  repeat?: [BeatMeasure, BeatMeasure]

  tempo: Tempo = 2

  voices!: Array<Voice>
  divido!: BeatDivido

  instrument!: PlayerController

  _init() {
    this.instrument = new PlayerController()
    this.bm = 0
    this.voices = []
    this.playing = true

    this.repeat = [0, make_bm(1, 0, 0, this.beats_per_measure)]

    this.divido = new BeatDivido(this.time_signature)
    this.divido.add_measure()
  }

  _update(dt: number, dt0: number) {
    this.t_quanti += dt


    if (this.t_quanti >= this.quanti_duration) {
      this.t_quanti = 0
      this.bm++;

      if (this.repeat) {
        if (this.bm >= this.repeat[1]) {
          this.bm = this.repeat[0]
          this.voices.forEach(_ => _.instrument_id && this.instrument.release(_.instrument_id, this.schedule_next_time))
          this.voices = []
        }
      }
    }

    if (this.beat0 !== this.current_beat) {
      //metronome
      //this.voices.push({ key: metronome_key, start: this.bm, end: this.bm + 1 })
    }

   btn_pitches_all.forEach((key, i) => {
      let x = this.input.btn(key),
        x0 = this.input.btn0(key)

      if (x > 0) {
        if (x0 === 0) {
          let voice: Voice = { key, start: this.bm }
          let po = voice_pitch_octave(voice)
          if (po) {
            voice.instrument_id = this.instrument.attack(make_note(po[0], po[1], 1), this.schedule_next_time)
          }
          this.voices.push(voice)
        }
      } else if (x === 0) {
        if (x0 > 0) {
          let voice = this.voices.find(_ => _.key === key)
          if (voice) {
            voice.end = this.bm
          }
        }
      }
    })

    this.voices = this.voices.filter(_ => {
      if (_.end !== undefined) {
        if (_.instrument_id) {
          this.instrument.release(_.instrument_id, this.schedule_next_time)
        }
        this.divido.add_note(_.start, _.end - _.start as BeatQuanti, voice_pitch_octave(_))
        this.redraw()
        return false
      }
      return true
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

    let ox = 2

    this.playback.divido.bmnrs.forEach(bmnr => {

      let bm = bmnr_bm(bmnr),
        nr = bmnr_nr(bmnr)

      let beat = bm_beat(bm, this.playback.beats_per_measure),
        quanti = bm_quanti(bm)

      if (is_note(nr)) {
        let pitch = note_pitch(nr),
          octave = note_octave(nr),
          duration = note_duration(nr)


        let flag = note_duration_flag(duration)

        let stem = duration > 2 ? {
          direction: 1,
          flag
        } : undefined

        res.push({ stem, code: note_duration_code(duration), klass: '', pitch, octave, ox, oy: 0 })
      } else {
        res.push({ code: rest_duration_code(nr), klass: '', pitch: 7 as Pitch, octave: 4 as Octave, ox, oy: 0 })
      }

      ox += (beat + quanti / 8) * 2
    })

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
