import { h, VNode } from 'snabbdom'
import Ctrl, { Playback } from './ctrl'
import g from './glyphs'

import { Tempo, Pitch, Octave } from './music'
import { FreeOnStaff } from './types'

export default function view(ctrl: Ctrl) {
  return h('div.m-wrap', [
    h('staff', { 
      class: { playing: ctrl.playback.playing }
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
      barline(),
    ])
  ])
}

const flag_code = ['eighth_flag', 'sixteenth_flag']

export function stem(free: FreeOnStaff) {

  if (!free.stem) {
    return []
  }

  let { stem } = free

  let x = 0
  let y = pitch_y(free.pitch, free.octave)
  let ox = free.ox,
    oy = free.oy + y

  let direction = 'down'

  return [h('span.stem.up', {
    style: {
      height: '0.9em',
      margin: '2em 0',
      transform: `translate(${ox}em, ${oy}em)`
    }
  }), stem.flag ? h('span.flag', {
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
    cursor(playback.current_beat, playback.beat_duration / 1000)
  ]
}

let beats = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

export function cursor_full(beat: number) {
  let ox = beat
  return h('div.cursor.full.beat_' + beats[beat], {
    style: {
      transform: `translate(calc(2em + ${ox}em), -50%)`
    }
  })
}

export function cursor(beat: number, duration: number) {
  let ox = beat
  return h('div.cursor.beat_' + beats[beat], {
    style: {
      'animation-duration': `${duration}s`,
      transform: `translate(calc(2em + ${ox}em), -50%)`
    }
  }, [h('span.fill', {
    style: {
      'animation-duration': `${duration}s`
    }
  })])
}

export function barline() {
  return h('span.barline', {
    style: {
      transform: `translate(6em, -50%)`
    }
  })
}

export function tempo(ctrl: Ctrl, bpm: number) {

  return h('span.tempo', {
    style: {
      transform: `translate(1em, -2.5em)`
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
