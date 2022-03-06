import { h, VNode } from 'snabbdom'
import Ctrl, { Playback } from './ctrl'
import g from './glyphs'
import { Voice } from './ctrl'

import { Tempo, Pitch, Octave } from './music'
import { FreeOnStaff } from './types'

import { BeatMeasure, bm_measure, bm_beat } from './music'

export default function view(ctrl: Ctrl) {
  return h('div.m-wrap', {
    hook: {
      insert(vnode: VNode) {
        ctrl.bindWrap(vnode.elm as HTMLElement)
      }
    }
  }, [
    h('staff.take_' + ctrl.playback.repeat_take, { 
      class: { 
        countdown: ctrl.playback.countdown_bm !== undefined,
        playing: ctrl.playback.playing
      }
    }, [
      ...playback(ctrl, ctrl.playback),
      h('lines', [
        h('line'),
        h('line'),
        h('line'),
        h('line'),
        h('line'),
      ]),
      tempo(ctrl, ctrl.playback.bpm),
      ...ctrl.frees.flatMap(_ => [
        free_on_staff(_),
        ...stem(_),
      ]),
      ...barlines(ctrl.playback.beats_per_measure),
    ])
  ])
}

const flag_code = ['eighth_flag', 'sixteenth_flag', 'thirtysecond_flag', 'sixtyfourth_flag']

export function stem(free: FreeOnStaff) {

  if (!free.stem) {
    return []
  }

  let { stem } = free

  let klass = free.klass

  let x = 0
  let y = pitch_y(free.pitch, free.octave)
  let ox = free.ox,
    oy = free.oy + y

  let direction = 'down'

  return [h('span.stem.up.' + klass, {
    style: {
      height: '0.9em',
      margin: '2em 0',
      transform: `translate(${ox}em, ${oy}em)`
    }
  }), stem.flag ? h('span.flag.' + klass, {
    style: {
      'margin-top': '0.9em',
      transform: `translate(${ox}em, ${oy}em)`
    }
  }, g[flag_code[stem.flag - 1] + '_' + direction]) : null]
}

export function playback(ctrl: Ctrl, playback: Playback) {
  return [
    /*
    ...playback.history
    .get_this_measure(playback.current_measure)
    .map((voices, i) =>
         cursor_full(i + 1)),
    */
    cursor(playback.current_measure * playback.beats_per_measure + playback.current_beat, playback.beat_duration / 1000, playback.countdown_ni),
    ...(playback.repeat?[
      repeat(playback, playback.repeat[0]),
      repeat(playback, playback.repeat[1]),
      repeat_fill(playback, playback.repeat)
    ]: [])
  ]
}

function repeat_fill(playback: Playback, repeat: [BeatMeasure, BeatMeasure]) {

  let [bm1, bm2] = repeat
  let ox1 = bm_measure(bm1, playback.beats_per_measure) * playback.beats_per_measure + bm_beat(bm1, playback.beats_per_measure)
  let ox2 = bm_measure(bm2, playback.beats_per_measure) * playback.beats_per_measure + bm_beat(bm2, playback.beats_per_measure)


  ox1 *= 2
  ox2 *= 2

  return h('div.repeat-fill', {
    style: {
      transform: `translate(calc(2em + ${ox1}em), -50%)`,
      width: `${ox2-ox1}em`
    }
  })
}


function repeat(playback: Playback, bm: BeatMeasure) {

  let ox = bm_measure(bm, playback.beats_per_measure) * playback.beats_per_measure + bm_beat(bm, playback.beats_per_measure)

  ox *= 2

  return h('div.repeat', {
    attrs: {
      title: 'Repeat'
    },
    style: {
      transform: `translate(calc(2em + ${ox}em), -50%)`
    }
  })
}

let beats = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

export function cursor_full(beat: number) {
  let ox = beat * 2
  return h('div.cursor.full.beat_' + beats[beat], {
    style: {
      transform: `translate(calc(2em + ${ox}em), -50%)`
    }
  })
}

export function cursor(beat: number, duration: number, countdown_ni?: number) {
  let ox = beat * 2
  return h('div.cursor.beat_' + beats[beat], {
    style: {
      'animation-duration': `${duration}s`,
      transform: `translate(calc(2em + ${ox}em), -50%)`
    }
  }, [countdown_ni ? h('span.countdown.fill', {
    style: {
      'animation-duration': `${duration}s`,
      height: `${countdown_ni * 100}%`
    }
  }): h('span.fill', {
    style: {
      'animation-duration': `${duration}s`
    }
  })])
}

export function barlines(width: number) {

  return [...Array(8).keys()]
  .flatMap(i => [h('span.barline', {
    style: {
      transform: `translate(calc(2em + ${width*(i+1)}em), -50%)`
    }
  }), h('div.measure-controls', {
    style: {
      transform: `translate(calc(2em + ${width*(i)}em), -50%)`
    }
  }, [])])
}

export function tempo(ctrl: Ctrl, bpm: number) {

  return h('div.tempo', {
    style: {
      transform: `translate(1em, -0.5em)`
    }
  }, [
    h('span', g['quarter_text']),
    h('span.strong', '='),
    h('span.strong', bpm)
  ])
}

function pitch_y(pitch: Pitch, octave: Octave) {
  return ((4 - octave) * 7 + 7 - pitch) * 0.25 / 2
}

export function free_on_staff(on_staff: FreeOnStaff) {
  let { code, klass, pitch, octave, ox, oy } = on_staff
  let y = pitch_y(pitch, octave),
    x = ox

  return h('span.' + code + '.' + klass, {
    style: {
      transform: `translate(calc(${x}em), calc(${y}em + ${oy}em))`
    }
  }, g[code])
}
