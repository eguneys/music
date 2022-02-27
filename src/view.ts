import { h, VNode } from 'snabbdom'
import Ctrl from './ctrl'
import g from './glyphs'

import { Clef, Music, Staff, Note, Notation, Notations } from './music'
import { note_line } from './music'

export default function view(ctrl: Ctrl) {

  let { music } = ctrl

  if (Array.isArray(music)) {

    return h('div.m-wrap', [
      h('div.brace-wrap', [
        h('div.brace', [
          staff(ctrl, music[0]),
          staff(ctrl, music[1])
        ]),
      ])
    ])
  } else {
    return h('div.m-wrap', [staff(ctrl, music)])
  }
}

function staff(ctrl: Ctrl, staff: Staff) {
  let { clef:  _clef, notes } = staff
  return h('div.staff-wrap', [
    h('lines', [h('line'), h('line'), h('line'), h('line'), h('line')]),
    h('div.notation', [
      clef(ctrl, _clef),
      ...notes.flatMap((_, i) => notations(ctrl, _clef, _, i, notes.length))
    ]))
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

  if (!text) {
    return h('span', style_transform(x_measure + (i/l) * 20, note_line(clef, notation)), g.whole_note)
  }

  return h('span.regular', regular_transform(x_measure + (i/l) * 20, note_line(clef, note!)), text)
}

function clef(ctrl: Ctrl, _clef: Clef) {
  let clef = _clef === 1 ? 'gclef' : 'bclef'

  let style

  if (clef === 'bclef') {
    style = style_transform(0, 4)
  } else {
    style = style_transform(0.15, 4)
  }
  return h('span.' + clef, , style, g[clef])
}

export function regular_transform(x: number, y: number) {
  return {
    style: {
      transform: `translate(calc(1.01em * ${x}), calc(0.5em * ${12-y} - 1em))`
    }
  }
}

export function style_transform(x: number, y: number) {
  return {
    style: { 
      transform: `translate(calc(1em * 0.25 * ${x}), calc(0.125em * ${12 - y} - 0.9725em))`
    }
  }
}
