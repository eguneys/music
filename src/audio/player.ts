import { Note, note_pitch, note_octave } from '../music/types'

type MidiNote = {
  freq: number
}

type Adsr = {
  a: number,
  d: number,
  s: number,
  r?: number
}

/* https://github.com/jergason/notes-to-frequencies/blob/master/index.js */
function note_freq(note: Note) {

  let octave = note_octave(note)
  let pitch = note_pitch(note)

  let n = pitch + octave * 12

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
  envelope!: GainNode

  get envelope_adsr() {
    return { a: 0.02, d: 0.3, s: 0.48,  r: 0.1 }
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

    let filter = new BiquadFilterNode(context, { type: 'lowpass' })
    osc1.connect(filter)

    let envelope = new GainNode(context)
    this.envelope = envelope
    filter.connect(envelope)
    envelope.connect(out_gain)

    let cutoff = 10000
    osc1.frequency.setValueAtTime(freq, now)

    ads(filter.frequency,
         now,
         { a: 0, d: 0.3, s: 0 },
         cutoff,
         cutoff * 1.5,
         cutoff)


    ads(envelope.gain,
         now,
         this.envelope_adsr,
         0,
         1,
         1)

         osc1.start(now)
  }


  _release(now: number) {


    //r(filter.frequency, { r: 0 }, cutoff)

    r(this.envelope.gain, now, this.envelope_adsr, 0)
    this.osc1.stop(now + 0.2)
  }
}
