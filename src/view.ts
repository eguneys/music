import { h, VNode } from 'snabbdom'
import Ctrl from './ctrl'
import g from './glyphs'

import { Clef, Staff, Note, Notation, Notations } from './music'
import { note_line } from './music'

export default function view(ctrl: Ctrl) {

  let { staff } = ctrl

  return h('div.m-wrap', [
    h('div.staff-wrap', [
      h('staff', [h('line'), h('line'), h('line'), h('line'), h('line')]),
    ]),
    h('div.notation', [
      clef(ctrl, staff.clef),
      ...staff.notes.flatMap((_, i) => notations(ctrl, staff.clef, _, i, staff.notes.length))
    ])
  ])
}

function notations(ctrl: Ctrl, clef: Clef, notations: Notations, i: number, l: number) {
  if (Array.isArray(notations)) {
    return notations.map(_ => notation(ctrl, clef, _, i, l))
  }
  return notation(ctrl, clef,  notations, i, l)
}

function notation(ctrl: Ctrl, clef: Clef, notation: Notation, i: number, l: number) {
  let { text, note } = notation

  let x_measure = 4.15
  return h('span.regular', regular_transform(x_measure + (i/l) * 20, note_line(clef, note!)), text)
}

function clef(ctrl: Ctrl, _clef: Clef) {
  let clef = _clef === 1 ? 'gclef' : 'bclef'

  /*
  if (notation === 'dbarline') {
    style = style_transform(24, 0)
  }
 */
  
  return h('span.' + clef, style_transform(0.15, 0), g[clef])
}

export function regular_transform(x: number, y: number) {
  return {
    style: {
      transform: `translate(calc(1em * ${x}), calc(0.5em * ${12-y} - 1em))`
    }
  }
}

export function style_transform(x: number, y: number) {
  return {
    style: { 
      transform: `translate(calc(0.25em * ${x}), calc(0.25em * ${y} + 0.02em))`
    }
  }
}
