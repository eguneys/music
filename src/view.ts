import { h, VNode } from 'snabbdom'
import Ctrl from './ctrl'

import g from './glyphs'

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
      ...ctrl.frees.map(_ => free_on_staff(_))
    ])
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
