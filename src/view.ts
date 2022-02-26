import { h, VNode } from 'snabbdom'
import Ctrl from './ctrl'
import * as g from './glyphs'

import * as m from './music'

console.log(m)

export default function view(ctrl: Ctrl) {

  let res: Array<NotationOrRegular>= [ { notation: 'gclef' },
    { regular: 'D', n: 'G4' },
    { regular: 'A', n: 'A3' },
    { regular: 'B', n: 'B3' },
    { regular: 'C', n: 'C3' },
    { regular: 'D', n: 'D3' },
    { regular: 'E', n: 'E3' },
    { regular: 'F', n: 'F3' },
    { regular: 'G', n: 'G3' },
    { regular: 'F', n: 'F4' },
    { regular: 'E', n: 'E4' },
    { regular: 'D', n: 'D4' },
    { notation: 'dbarline' }
  ]

  let x_measure = 5.15

  return h('div.m-wrap', [
    h('div.staff-wrap', [
      h('staff', [h('line'), h('line'), h('line'), h('line'), h('line')]),
    ]),
    h('div.notation', res.map((_,i) => notation_or_regular(ctrl, _, i)))
    /*
    h('div.notation', [
      h('span.gclef', style_transform(0.15, 0), g.gclef),
      h('span.regular', regular_transform(x_measure + 6, 5), 'D'),
      h('span.regular', regular_transform(x_measure + 4, 4.5), 'E'),
      h('span.regular', regular_transform(x_measure + 2, 4), 'F'),
      h('span.regular', regular_transform(x_measure + 0, 3.5), 'G'),
      h('span.regular', regular_transform(x_measure + 2, 3), 'A'),
      h('span.regular', regular_transform(x_measure + 4, 2.5), 'B'),
      h('span.regular', regular_transform(x_measure + 6, 2), 'C'),
      h('span.regular', regular_transform(x_measure + 8, 1.5), 'D'),
      h('span.regular', regular_transform(x_measure + 10, 1), 'E'),
      h('span.regular', regular_transform(x_measure + 12, 0.5), 'F'),
      h('span.regular', regular_transform(x_measure + 14, 0), 'G'),
      h('span.dbarline', style_transform(24, 0), g.dbarline)

      h('span.bclef', style_transform(3, 3.5 - 0.18), g.bclef),
      h('span.half_note', style_transform(4, 0), g.half_note),
      h('span.half_note', style_transform(5, 1), g.half_note),
      h('span.half_note', style_transform(5, 2), g.half_note),
      h('span.half_note', style_transform(5, 3), g.half_note),
      h('span.half_note', style_transform(5, 4), g.half_note),
      h('span.half_note', style_transform(5, 5), g.half_note),
      h('span.half_note', style_transform(6, 1.5), g.half_note),
      h('span.half_note', style_transform(6, 2.5), g.half_note),
      h('span.half_note', style_transform(6, 3.5), g.half_note),
      h('span.half_note', style_transform(6, 4.5), g.half_note),
      h('span.half_note', style_transform(6, 5.5)
    ])
   */
  ])
}

type HasPos = {
  n?: string
}

type Notation = 'gclef' | 'dbarline'

type HasNotation = HasPos & {
  notation: Notation
}

type HasRegular = HasPos & {
  regular: string
}


type NotationOrRegular = HasNotation | HasRegular

function notation_or_regular(ctrl: Ctrl, notation_or_regular: NotationOrRegular, i: number) {
  if ('notation' in notation_or_regular) {
    return notation(ctrl, notation_or_regular, i)
  } else {
    return regular(ctrl, notation_or_regular, i)
  }
}

function regular(ctrl: Ctrl, has_regular: HasRegular, i: number) {
  let { regular } = has_regular

  let x_measure = 5.15
  return h('span.regular', regular_transform(x_measure + i, 0), regular)
}

function notation(ctrl: Ctrl, has_notation: HasNotation, i: number) {
  let { notation } = has_notation

  let style = {}

  if (notation === 'gclef') {
    style = style_transform(0.15, 0)
  }

  if (notation === 'dbarline') {
    style = style_transform(24, 0)
  }


  return h('span.' + notation , style, g[notation])
}

export function regular_transform(x: number, y: number) {
  return {
    style: {
      transform: `translate(calc(1em * ${x}), calc(1em * ${y} - 1em))`
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
