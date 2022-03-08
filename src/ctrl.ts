import { ticks } from './shared'
import { memo, Memo } from './util'
import { Clef, Pitch, Octave, Duration, Tempo, TimeSignature } from './music'
import { make_note, make_time_signature, is_tempo, is_note, is_rest } from './music'
import { Note, note_accidental, note_pitch, note_octave, note_duration } from './music'
import { NoteValue, NbNoteValuePerMeasure, time_nb_note_value, time_note_value } from './music'

import { Accidental } from './music'
import { Beat, Measure, BeatQuanti, BeatMeasure } from './music'
import { bm_beats, bm_beat, bm_quanti, bm_measure, make_bm } from './music'
import { BeatMeasureNoteRest, make_bmnr, bmnr_bm, bmnr_nr } from './music'

import { Config } from './config'
import Input from './input'
import Mouse, { eventPosition, MouchEvent } from './mouse'

import { FreeOnStaff, Direction } from './types'

import { PlayerController } from './audio/player'

export type Redraw = () => void

type Context = {
  input: Input,
  mouse: Mouse
}

abstract class IPlay {

  _schedule_redraw = true

  data: any

  get mouse() { return this.ctx.mouse }
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


function free_note_parts(nr: Note, ox: number, klass: string = '') {
  let pitch = note_pitch(nr),
    octave = note_octave(nr),
    duration = note_duration(nr),
    accidental = note_accidental(nr)


  let flag = note_duration_flag(duration)

  let stem = duration > 2 ? {
    direction: 1 as Direction,
    flag
  } : undefined

  return [{ stem, code: note_duration_code(duration), klass, pitch, octave, accidental, ox, oy: 0 }]
}




let btn_accidentals = ['i', 'o', 'p','[',']']
let btn_accidentals_octave_up = ['w', 'e', 'r','t','y']
let btn_pitches = [' ', 'j', 'k', 'l', ';', '\'', '\\']
let btn_pitches_octave_up = ['a', 's', 'd', 'f', 'g', 'h']
let btn_rest = 'Backspace'

let btn_pitches_all = [...btn_accidentals, ...btn_accidentals_octave_up, ...btn_pitches, ...btn_pitches_octave_up, btn_rest]

let btn_reset = 'Enter'
let btn_play = '*'

let btn_tie = 't'


type PitchOctaveAccidental = [Pitch, Octave, Accidental | undefined]
// TODO GC
function voice_pitch_octave_accidental(voice: Voice): PitchOctaveAccidental | undefined {
  let { key } = voice
  let pitch = btn_pitches.indexOf(key) + 1
  if (pitch > 0) {
    return [pitch, 4, undefined] as PitchOctaveAccidental
  }
  pitch = btn_pitches_octave_up.indexOf(key) + 1
  if (pitch > 0) {
    return [pitch, 5, undefined] as PitchOctaveAccidental
  }

  pitch = btn_accidentals.indexOf(key) + 1
  if (pitch > 0) {
    if (pitch <= 2) {
      return [pitch, 4, 1] as PitchOctaveAccidental
    } else {
      return [pitch + 1, 4, 1] as PitchOctaveAccidental
    }
  }
  pitch = btn_accidentals_octave_up.indexOf(key) + 1
  if (pitch > 0) {
    if (pitch <= 2) {
      return [pitch, 5, 1] as PitchOctaveAccidental
    } else {
      return [pitch + 1, 5, 1] as PitchOctaveAccidental
    }
  }
}

const tempos = [10, 60, 80, 90, 120, 168, 200, 400]

export type Voice = {
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
const auto_key = 'auto_key'

const duration_codes = ['double', 'whole', 'half', 'quarter', 'quarter', 'quarter', 'quarter', 'quarter']
function note_duration_code(duration: Duration) {
  return duration_codes[duration - 1] + '_note'
}

const rest_codes = ['double', 'whole', 'half', 'quarter', 'eighth', 'sixteenth', 'thirtysecond', 'sixtyfourth', 'onetwentyeighth']
function rest_duration_code(duration: Duration) {
  return rest_codes[duration - 1] + '_rest'
}

const duration_flag_codes = [undefined, undefined, undefined, undefined, 1, 2, 3, 4, 5]
function note_duration_flag(duration: Duration) {
  return duration_flag_codes[duration - 1]
}

const nb_note_value_codes = [,,'two','three','four','five','six','seven','eight','nine','ten','eleven','twelve']
function nb_note_value_code(nb_note_value: NbNoteValuePerMeasure) {
  return nb_note_value_codes[nb_note_value]
}

const note_value_codes = [,, 'two', 'four', 'eight', 'sixteen']
function note_value_code(note_value: NoteValue) {
  return note_value_codes[note_value - 1]
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

  next_bmnr_index_with_same_pitch(index: number) {
    let bmnr = this.bmnrs[index]
    let nr = bmnr_nr(bmnr)
    if (is_note(nr)) {

      let pitch = note_pitch(nr),
        octave = note_octave(nr)


      for (let i = index + 1; i < this.bmnrs.length; i++) {

        let _bmnr = this.bmnrs[i]
        let _nr = bmnr_nr(_bmnr)

        if (is_note(_nr)) {

          if (pitch === note_pitch(_nr) && octave === note_octave(_nr)) {
            return i
          }
        }


      }
    }
  }

  bmnr_at_index(index: number) {
    let _bm = 0
    for (let i = 0; i < index; i++) {
      let bmnr = this.bmnrs[i]

      _bm += bmnr_bm(bmnr)
    }
    return make_bmnr(_bm, bmnr_nr(this.bmnrs[index]))
  }


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

  bmnri_at_bm(bm: BeatMeasure) {
    let start_quanti = bm as BeatQuanti,
      end_quanti = bm + 1 as BeatQuanti

    let [start_i, end_i, off_start, off_end] = this.scan_data(start_quanti, end_quanti)

    if (start_i !== undefined && end_i !== undefined) {
      if (off_start === 0) {


        return start_i
      }
    }
  }

  scan_data(start_quanti: BeatQuanti, end_quanti: BeatQuanti): [number | undefined, number | undefined,  number, number] {

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

    return [start_i, end_i, off_start, off_end]
  }


  add_note(bm: BeatMeasure, nb_quanti: BeatQuanti, po?: [Pitch, Octave, Accidental|undefined]) {
    let measure = bm_measure(bm, this.nb_beats),
      beat = bm_beat(bm, this.nb_beats),
      quanti = bm_quanti(bm)

    if (nb_quanti === 0) {
      return
    }

    let [quantized_left, quantized_subs] = this.quanti_in_subs(nb_quanti)

    nb_quanti = nb_quanti - quantized_left as BeatQuanti
    let note_duration = this.quanti_note_value(nb_quanti)

    //console.log(beat, quanti, this.sub_quanties_for_note_values, this.note_value, nb_quanti, quantized_subs, note_duration, quantized_left)
    let start_quanti = (measure * this.nb_beats + beat) * 8 + quanti as BeatQuanti,
      end_quanti = start_quanti + nb_quanti as BeatQuanti

    let [start_i, end_i, off_start, off_end] = this.scan_data(start_quanti, end_quanti)

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

      let i_notes = quantized_subs
      .flatMap((_, i) => [...Array(_)]
               .map(() =>
                    make_bmnr(
                      this.sub_quanties_for_note_values[i],
                      po?make_note(po[0], po[1], 
                                   this.quanti_note_value(this.sub_quanties_for_note_values[i]), po[2]):
                                   this.quanti_note_value(this.sub_quanties_for_note_values[i])
                                  )))

      let removed = this.bmnrs.splice(start_i, end_i - start_i + 1, ...b_notes, ...i_notes, ...e_notes)
      return true
    }

    return false
  }

  rest_interval(start: BeatMeasure, end: BeatMeasure) {

    let start_quanti = start as BeatQuanti,
      end_quanti = end as BeatQuanti


    let [start_i, end_i, off_start, off_end] = this.scan_data(start_quanti, end_quanti)

    if (start_i !== undefined && end_i !== undefined) {
      let [left, subs] = this.quanti_in_subs(end_quanti - start_quanti as BeatQuanti)

      let b_rests = subs
      .flatMap((_, i) => [...Array(_)]
               .map(() =>
                    make_bmnr(
                      this.sub_quanties_for_note_values[i],
                      this.quanti_note_value(this.sub_quanties_for_note_values[i])))
              )

       this.bmnrs.splice(start_i, end_i - start_i + 1, ...b_rests)
    }


  }

  add_measure() {
    [...Array(this.nb_beats)].forEach(_ => 
      this.bmnrs.push(make_bmnr(make_bm(0, 1, 0, this.nb_beats), this.note_value)))
  }

}

export class PlayWithDivido extends IPlay {

  get schedule_next_time(): number {
    return this.instrument.currentTime
  }

  get divido(): BeatDivido { 
    return (this.data as DividoAndTies).divido 
  }

  get ties(): Ties {
    return (this.data as DividoAndTies).ties
  }

  get time_signature(): TimeSignature {
    return this.divido.time_signature
  }

  voices!: Array<Voice>
  instrument!: PlayerController
  playback!: Playback

  _init() {
    this.instrument = new PlayerController()

    this.voices = []
    this.playback = new Playback(this.ctx)._set_data(this.time_signature).init()
  }


  _update(dt: number, dt0: number) {
    this.playback.update(dt, dt0)

    if (this.playback.on_reset) {

      this.voices.forEach(_ => _.instrument_id && this.instrument.release(_.instrument_id, this.schedule_next_time))
      this.voices = []
    } else if (this.playback.bm !== this.playback.bm0 ||
        /* TODO superflous track begin check */
        (this.playback.countdown_bm === undefined && this.playback.bm === 0 && this.playback.bm0 === 0 && this.playback.t_quanti === 0)) {
      let bmnr_i = this.divido.bmnri_at_bm(this.playback.bm)
      if (bmnr_i !== undefined) {
        let bmnr = this.divido.bmnrs[bmnr_i]
        let nr = bmnr_nr(bmnr)
        let tie_end = this.ties.ties.find(_ => _[1] === bmnr_i)
        if (is_note(nr) && !tie_end) {

          let duration = bmnr_bm(bmnr) 

          let tied_note = this.ties.ties.find(_ => _[0] === bmnr_i)
          if (tied_note) {
            let tied_bmnr = this.divido.bmnrs[tied_note[1]]
            duration += bmnr_bm(tied_bmnr)
          }

          let voice: Voice = { 
            key: auto_key, 
            start: this.playback.bm, 
            end: this.playback.bm + duration
          
          }
          voice.instrument_id = this.instrument
          .attack(nr, this.schedule_next_time)
          this.instrument.release(voice.instrument_id, 
                                  this.schedule_next_time + 
                                    duration * this.playback.quanti_duration / 1000)
        }
      }
    }


    this._schedule_redraw ||= this.playback._schedule_redraw
  }
}

export class PlayWithKeyboard extends IPlay {

  get schedule_next_time(): number {
    return this.instrument.currentTime
  }

  get time_signature(): TimeSignature {
    return this.divido.time_signature
  }

  get divido(): BeatDivido {
    return (this.data as DividoAndTies).divido
  }

  get ties(): Ties {
    return (this.data as DividoAndTies).ties
  }


  voices!: Array<Voice>
  instrument!: PlayerController

  playback!: Playback


  _init() {
    this.instrument = new PlayerController()

    this.voices = []

    this.playback = new Playback(this.ctx)._set_data(this.time_signature).init()
  }



  _update(dt: number, dt0: number) {

    this.playback.update(dt, dt0)

    if (this.playback.on_reset) {
      // TODO leak
      if (this.playback.repeat) {
        this.ties.ties = []
        this.divido.rest_interval(...this.playback.repeat)
      }
      this.voices.forEach(_ => _.instrument_id && this.instrument.release(_.instrument_id, this.schedule_next_time))
      this.voices = []
    }


    if (this.playback.on_repeat) {
      // TODO off by one
      this.voices.forEach(_ => _.end = this.playback.bm0! + 1)
    }


   btn_pitches_all.forEach((key, i) => {
      let x = this.input.btn(key),
        x0 = this.input.btn0(key)

      if (x > 0) {
        if (x0 === 0) {
          let voice: Voice = { key, start: this.playback.bm }
          let po = voice_pitch_octave_accidental(voice)
          if (po) {
            voice.instrument_id = this.instrument.attack(make_note(po[0], po[1], 1, po[2]), this.schedule_next_time)
          }
          this.voices.push(voice)
        }
      } else if (x === 0) {
        if (x0 > 0) {
          let voice = this.voices.find(_ => _.key === key)
          if (voice && !voice.end) {
            voice.end = this.playback.bm
          }
        }
      }
    })




    this.voices = this.voices.filter(_ => {
      if (_.end !== undefined) {
        if (_.instrument_id) {
          this.instrument.release(_.instrument_id, this.schedule_next_time)
        }
        this.divido.add_note(_.start, _.end - _.start as BeatQuanti, voice_pitch_octave_accidental(_))
        this.redraw()
        return false
      }
      return true
    })

    this._schedule_redraw ||= this.playback._schedule_redraw
  }
}

type DividoAndTies = {
  divido: BeatDivido,
  ties: Ties
}

export class NoteSelection extends IPlay {

  get divido(): BeatDivido { return (this.data as DividoAndTies).divido }
  get ties(): Ties { return (this.data as DividoAndTies).ties }

  current_index!: number

  _init() {
    this.current_index = -1
  }


  _update(dt: number, dt0: number) {


    if (this.input.btnp('left')) {
      this.current_index--;
    } else if (this.input.btnp('right')) {
      this.current_index++;
    }

    if (this.input.btnpp(btn_tie)) {
      if (this.ties.ties.find(_ => _[0] === this.current_index)) {
        this.ties.ties = this.ties.ties.filter(_ => _[0] !== this.current_index)
      } else {
        let next = this.divido.next_bmnr_index_with_same_pitch(this.current_index)

        if (next) {
          this.ties.add_tie(this.current_index, next)
        }
      }
    }

  }
}

type NotesTie = [number, number]

export class Ties extends IPlay {

  ties!: Array<NotesTie>

  _init() {
    this.ties = []
  }

  add_tie(n1: number, n2: number) { this.ties.push([n1, n2]) }
  remove_tie(n1: number) { }

  _update(dt: number, dt0: number) {
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

  get current_quanti(): BeatQuanti {
    return bm_quanti(this.bm)
  }

  get countdown_ni(): number | undefined {
    if (this.countdown_bm) {
      return Math.ceil((this.countdown_bm / 8)) / 3
    }
  }

  get on_reset(): boolean {
    return this.reset_take !== this.reset_take0
  }

  get on_repeat(): boolean {
    return this.repeat_take !== this.repeat_take0
  }

  measure0?: Measure
  beat0?: Beat

  t_quanti: number = 0


  bm!: BeatMeasure
  countdown?: BeatMeasure
  repeat?: [BeatMeasure, BeatMeasure]

  countdown_bm?: BeatMeasure

  playing!: boolean
  repeat_take!: number
  reset_take!: number

  bm0?: number
  repeat_take0?: number
  reset_take0?: number

  tempo!: Tempo


  _playback_control_isplaying!: boolean

  _init() {
    this.bm = 0
    this.playing = false
    this.repeat_take = 1
    this.countdown = make_bm(0, 3, 0, this.beats_per_measure)
    this.countdown_bm = 0

    this.tempo = 2

    this.repeat = [0, make_bm(2, 0, 0, this.beats_per_measure)]

    this.reset_take = 0

    this._playback_control_isplaying = false
  }

  set_play(v: boolean) {
    this._playback_control_isplaying = v || !this._playback_control_isplaying

    this.t_quanti = 0
    this.countdown_bm = 0
    this.bm = this.repeat?.[0] || 0
    this.playing = false
    this.redraw()
  }

  _update(dt: number, dt0: number) {
    this.bm0 = this.bm
    this.repeat_take0 = this.repeat_take
    this.reset_take0 = this.reset_take


    if (this._playback_control_isplaying) {
      this.t_quanti += dt
    }

    if (this.input.btnp(btn_reset)) {
      if (this.repeat) {
        this.reset_take++

        this.countdown_bm = 0
        this.t_quanti = 0
        this.repeat_take = 1
        this.playing = false

        this.bm = this.repeat[0]
        this.redraw()
      }
    }

    if (this.t_quanti >= this.quanti_duration) {
      this.t_quanti = 0


      if (this.countdown) {
        if (this.countdown_bm !== undefined) {
          this.countdown_bm++;

          if (this.countdown_bm >= this.countdown) {
            this.countdown_bm = undefined
            this.playing = true
          }
        } else {
          this.bm++;
        }
      } else {
        this.bm++;
      }

      if (this.repeat) {
        if (this.bm >= this.repeat[1]) {
          this.repeat_take++
          this.bm = this.repeat[0]
        }
      }
    }

    if (this.beat0 !== this.current_beat) {
      //metronome
      //this.voices.push({ key: metronome_key, start: this.bm, end: this.bm + 1 })
    }
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

    this.beat0 = this.current_beat
    this.measure0 = this.current_measure
  }
}
export default class Ctrl extends IPlay {

  // properties


  _em!: Memo<number>

  get em(): number {
    return this._em?.() || 0
  }

  _bounds!: Memo<ClientRect>
  get bounds(): ClientRect {
    return this._bounds?.() || {}
  }

  play_with_keyboard!: PlayWithKeyboard
  play_with_divido!: PlayWithDivido

  note_selection!: NoteSelection

  control!: any


  current_drag_repeat?: number

  divido!: BeatDivido
  ties!: Ties

  get playback(): Playback {
    return this.control.playback
  }

  get voices(): Array<Voice> {
    return this.play_with_keyboard.voices
  }


  get frees(): Array<FreeOnStaff> {
    let res = []


    let nb_note_value = time_nb_note_value(this.playback.time_signature),
      note_value = time_note_value(this.playback.time_signature)

    res.push({ code: 'gclef', klass: '', pitch: 5 as Pitch, octave: 4 as Octave, ox: 0.2, oy: 0 })
    res.push({ code: nb_note_value_code(nb_note_value) + '_time', klass: '', pitch: 2 as Pitch, octave: 5 as Octave, ox: 1, oy: 0 })
    res.push({ code: note_value_code(note_value) + '_time', klass: '', pitch: 5 as Pitch, octave: 4 as Octave, ox: 1, oy: 0 })

    let ox = 2

    this.divido.bmnrs.forEach((bmnr, i) => {
      let bm = bmnr_bm(bmnr),
        nr = bmnr_nr(bmnr)

      let beat = bm_beat(bm, this.playback.beats_per_measure),
        quanti = bm_quanti(bm)

      let selected = this.note_selection.current_index === i


      let klass = selected ? 'selected':''

      if (is_note(nr)) {
        res.push(...free_note_parts(nr, ox,klass))
      } else {
        res.push({ code: rest_duration_code(nr), klass, pitch: 7 as Pitch, octave: 4 as Octave, ox, oy: 0 })
      }

      ox += (beat + quanti / 8) * 2
    })


    let voice = this.voices[0]

    if (voice) {
      let po = voice_pitch_octave_accidental(voice)
      if (po) {
        // TODO make abstraction
        let nb_quanti = this.playback.bm - voice.start as BeatQuanti

        if (nb_quanti === 0) {
          return res
        }

        let [quantized_left, quantized_subs] = this.divido.quanti_in_subs(nb_quanti)

        nb_quanti = nb_quanti - quantized_left as BeatQuanti
        let note_duration = this.divido.quanti_note_value(nb_quanti)

        let nr = make_note(po[0], po[1], note_duration, po[2])
        res.push(...free_note_parts(nr, 2 + (voice.start / 8) * 2, 'voice'))
      }
    }

    return res
  }

  on_start(e: MouchEvent) {
    let pos = eventPosition(e)
    if (pos) {
      let [x, y] = pos

      if (y > this.bounds.y + this.bounds.height - this.em * 0.5) {

        let { repeat, beats_per_measure } = this.control.playback

        if (repeat) {
          let bm1 = bm_beats(repeat[0], beats_per_measure),
            bm2 = bm_beats(repeat[1], beats_per_measure)

          let x1 = this.em * (bm1 * 2 + 2),
            x2 = this.em * (bm2 * 2 + 2),
            lee = this.em * 0.2

          if (x1 - lee < x && x < x1 + lee) {
            this.current_drag_repeat = 0
          } else if (x2 - lee < x && x < x2 + lee) {
            this.current_drag_repeat = 1
          }
        }

      }

    }
  }

  bindWrap(elm: HTMLElement) {


    this._bounds = memo(() => elm.getBoundingClientRect())
    this._em = memo(() => parseFloat(getComputedStyle(elm).fontSize))


    const onStart = (e: MouchEvent) => this.on_start(e)
    elm.addEventListener('touchstart', onStart, { passive: false })
    elm.addEventListener('mousedown', onStart, { passive: false })
  }

  _init() {

    let time = make_time_signature(4, 4)
    this.divido = new BeatDivido(time)
    this.divido.add_measure()
    this.divido.add_measure()

    this.ties = new Ties(this.ctx).init()
    let { divido, ties } = this

    let dandt = {
      divido,
      ties
    }

    this.play_with_keyboard = new PlayWithKeyboard(this.ctx)._set_data(dandt).init()
    this.play_with_divido = new PlayWithDivido(this.ctx)._set_data(dandt).init()
    this.play_with_divido.playback = this.play_with_keyboard.playback
    
    this.control = this.play_with_keyboard

    this.note_selection = new NoteSelection(this.ctx)._set_data(dandt).init()
  }


  save() {
    let { bmnrs } = this.divido
    let { ties } = this.ties

    return JSON.stringify({bmnrs, ties })
  }

  restore(data: any) {
    let { bmnrs, ties } = JSON.parse(data)

    if (bmnrs) {
      this.divido.bmnrs = bmnrs
      this.ties.ties = ties
    }
  }

  _update(dt: number, dt0: number) {

    if (this.input.btnp('Tab')) {
      this.control = this.control === this.play_with_divido ? this.play_with_keyboard : this.play_with_divido
    }

    if (this.input.btnp(btn_play)) {
      this.control.playback.set_play()
    }

    if (this.mouse.click_end) {
      this.current_drag_repeat = undefined
    }

    if (this.current_drag_repeat !== undefined) {
      let { repeat } = this.control.playback
      
      if (repeat) {
        let bm = Math.max(0, (this.mouse.x / this.em) - 2)

        let beat = Math.round(bm / 2) as Beat

        let _r0 = repeat[this.current_drag_repeat]

        repeat[this.current_drag_repeat] = make_bm(0, beat, 0, 
                                                   this.control.playback.beats_per_measure)

        if (repeat[0] === repeat[1]) {
          repeat[this.current_drag_repeat] = _r0
        } else if (repeat[0] > repeat[1]) {

          _r0 = repeat[0]
          repeat[0] = repeat[1]
          repeat[1] = _r0

          this.current_drag_repeat++;
          this.current_drag_repeat %= 2
        }
        this.redraw()
      }

    }

    this.note_selection.update(dt, dt0)
    this.control.update(dt, dt0)

    this._schedule_redraw = this.control._schedule_redraw
  }
}
