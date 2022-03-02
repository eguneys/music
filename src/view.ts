import { h, VNode } from 'snabbdom'
import Ctrl from './ctrl'

import g from './glyphs'

import { Tempo, Pitch, Octave } from './music'
import { FreeOnStaff } from './types'

export default function view(ctrl: Ctrl) {
  return h('div.m-wrap', [
    h('staff', { 
      class: {
        playing: ctrl.voices.length > 0
      }
    }, [
      cursor(0, ctrl.beat_duration/1000),
      h('lines', [
        h('line'),
        h('line'),
        h('line'),
        h('line'),
        h('line'),
      ]),
      ctrl.tempo ? tempo(ctrl, ctrl.bpm) : null,
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

export function cursor(ox: number, duration: number) {
  return h('div.cursor', {
    style: {
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
