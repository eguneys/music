import { Note, note_pitch, note_octave, note_accidental } from '../music/types'

type MidiNote = {
  freq: number
}

type Adsr = {
  a: number,
  d: number,
  s: number,
  r?: number
}

/* C C# D D# E F F# G G# A A# B */
const pitch_to_freq_index = [1, 1.5, 2, 2.5, 3, 4, 4.5, 5, 5.5, 6, 6.5, 7]
/* https://github.com/jergason/notes-to-frequencies/blob/master/index.js */
/* http://techlib.com/reference/musical_note_frequencies.htm#:~:text=Starting%20at%20any%20note%20the,be%20positive%2C%20negative%20or%20zero. */
/* https://newt.phys.unsw.edu.au/jw/notes.html */
function note_freq(note: Note) {

  let octave = note_octave(note)
  let pitch = note_pitch(note)
  let accidental = note_accidental(note)

  if (accidental === 1) {
    pitch += 0.5
  }
  let n = pitch_to_freq_index.indexOf(pitch)

  n += octave * 12

  console.log(pitch, octave, n, 440 * Math.pow(2, (n - 57) / 12))

  return 440 * Math.pow(2, (n - 57) / 12)
}

function ads(param: AudioParam, now: number, { a,d,s,r }: Adsr, start: number, max: number, min: number) {
  param.setValueAtTime(start, now)
  param.linearRampToValueAtTime(max, now + a)
  param.linearRampToValueAtTime(min, now + a + d)

  /* not needed ? */
  //param.setValueAtTime(min, now + a + d + s)
}

function r(param: AudioParam, now: number, { r }: Adsr, min: number) {
  param.cancelScheduledValues(now)
  param.linearRampToValueAtTime(min, now + (r || 0))
}

export class PlayerController {

  _context?: AudioContext

  get context(): AudioContext {
    if (!this._context) {
      this._context = new AudioContext()
    }
    return this._context
  }


  get currentTime(): number {
    return this.context.currentTime
  }

  _gen_id: number = 0
  get next_id(): number {
    return ++this._gen_id
  }

  players: Map<number, HasAudioAnalyser> = new Map()

  attack(note: Note, time: number = 0) {

    let { next_id } = this

    this.players.set(next_id, new MidiPlayer(this.context)
                     ._set_data({
                       freq: note_freq(note)
                     }).attack(time))
    return next_id
  }

  release(id: number, time: number = 0) {
    let player = this.players.get(id)
    if (player) {
      player.release(time)
    }
    this.players.delete(id)
  }
}

abstract class HasAudioAnalyser {
  analyser?: AnalyserNode

  gain?: GainNode

  constructor(readonly context: AudioContext) {}

  attack(time: number = this.context.currentTime) {
    let { context } = this

    this.gain = context.createGain()
    this.analyser = context.createAnalyser()

    this.gain.gain.setValueAtTime(0.1, time)
    this.gain!.connect(this.analyser)
    this.analyser.connect(context.destination)

    this._attack(time)
    return this
  }

  release(time: number = this.context.currentTime) {
    this._release(time)
    return this
  }


  abstract _attack(time: number): void
  abstract _release(time: number): void
}


export class MidiPlayer extends HasAudioAnalyser {

  data!: MidiNote

  osc1!: OscillatorNode
  osc2!: OscillatorNode
  envelope!: GainNode

  get envelope_adsr() {
    return { a: 0.02, d: 0.1, s: 0.48,  r: 0.3 }
  }

  _set_data(data: MidiNote) {
    this.data = data
    return this
  }

  _attack(now: number) {

    let { context } = this
    let out_gain = this.gain!

    let { freq } = this.data

    let osc1 = new OscillatorNode(context, { type: 'sawtooth' })
    this.osc1 = osc1

    let osc2 = new OscillatorNode(context, { type: 'sawtooth' })
    this.osc2 = osc2


    let osc1_mix = new GainNode(context)
    osc1.connect(osc1_mix)
    let osc2_mix = new GainNode(context)
    osc2.connect(osc2_mix)

    osc1_mix.gain.setValueAtTime(0.5, now)
    osc2_mix.gain.setValueAtTime(0.5, now)

    osc2.detune.setValueAtTime(700, now)

    let filter = new BiquadFilterNode(context, { type: 'lowpass' })
    osc1_mix.connect(filter)
    osc2_mix.connect(filter)


    let envelope = new GainNode(context)
    this.envelope = envelope
    filter.connect(envelope)
    envelope.connect(out_gain)



    let cutoff = 3500
    osc1.frequency.setValueAtTime(freq, now)

    osc2.frequency.setValueAtTime(freq, now)

    ads(filter.frequency,
         now,
         { a: 0, d: 0.2, s: 0 },
         cutoff,
         cutoff * 3,
         cutoff)


    ads(envelope.gain,
         now,
         this.envelope_adsr,
         0,
         1,
         1)

         osc1.start(now)
         osc2.start(now)
  }


  _release(now: number) {


    //r(filter.frequency, { r: 0 }, cutoff)

    r(this.envelope.gain, now, this.envelope_adsr, 0)
    this.osc1.stop(now + 0.2)
    this.osc2.stop(now + 0.2)
  }
}
