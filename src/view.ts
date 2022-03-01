import { h, VNode } from 'snabbdom'
import Ctrl from './ctrl'

import g from './glyphs'

import { Tempo, tempo_tempo } from './music'
import { FreeOnStaff } from './types'

export default function view(ctrl: Ctrl) {

  return h('div.m-wrap', [
    h('staff', [
      h('lines', [
        h('line'),
        h('line'),
        h('line'),
        h('line'),
        h('line'),
      ]),
      ctrl.tempo ? tempo(ctrl, ctrl.tempo) : null,
      ...ctrl.frees.map(_ => free_on_staff(_))
    ])
  ])
}

export function tempo(ctrl: Ctrl, tempo: Tempo) {

  return h('span.tempo', {
    style: {
      transform: `translate(1em, -2.5em)`
    }
  }, [
    h('span', g['quarter_text']),
    h('span.strong', '='),
    h('span.strong', tempo_tempo(tempo))
  ])
}

export function free_on_staff(on_staff: FreeOnStaff) {
  let { code, klass, pitch, octave, ox, oy } = on_staff
  let y = ((4 - octave) * 7 + 7 - pitch) * 0.25 / 2,
    x = ox

  return h('span.' + code + '.' + klass, {
    style: {
      transform: `translate(calc(${x}em), calc(${y}em + ${oy}em))`
    }
  }, g[code])
}
