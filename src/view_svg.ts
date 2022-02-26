import { h, VNode } from 'snabbdom'
import Ctrl from './ctrl'
import symbols from './symbols'

let h_lines = 320
let h_pad = h_lines
let h_staff = h_lines + h_pad * 2
let w_staff = h_lines * 20
let h_line = h_lines / 5
let w_v = w_staff
let h_v = h_lines + h_pad * 2
let h_line_stroke = h_line * 0.1
let h_whole = h_line
let h_half = h_whole / 2
let h_gclef = h_lines + h_whole * 3 
let h_time = h_whole * 2

let w_half = h_half

let w_stem_stroke = h_line_stroke * 1.1 
let h_stem_height = 3 * h_whole + h_half

let w_gclef = h_gclef * 0.4
let w_time = h_time


let y_center_staff = h_staff / 2
let y_go = h_pad
let y_e = y_go + h_whole
let y_c = y_e + h_whole
let y_a = y_c + h_whole
let y_f = y_a + h_whole

let y_lf = y_go + h_half
let y_ld = y_lf + h_whole
let y_lb = y_ld + h_whole
let y_lg = y_lb + h_whole
let y_le = y_lg + h_whole


let x_time = h_half + w_gclef + h_half
let x_measure0 = x_time + w_time + h_whole * 2

let w_bars = w_staff - x_measure0

let w_bar5 = w_bars / 5
let w_bar5_3 = w_bar5 / 3

let x_bar5 = w_bar5 + h_whole * 2

let lines = [0, 1, 2, 3, 4]

export default function view(ctrl: Ctrl): VNode {
  return h('svg', { attrs: { width: '100%', height: '100%', preserveAspectRatio: 'xMinYMin', viewBox: `0 0 ${w_v} ${h_v}` } }, [
    style,
    ...symbols,
    ...staff(0),
  ])

}

const style = h('style', `
.info {
  font: normal ${h_whole}px sans-serif;
} 
`)

function staff(y: number) {

  let ys = lines.map(_ => _ * h_line)

  return [h('rect', { attrs: { width: '100%', height: '100%', fill: 'white' } }),
    ...ys.map(y =>
              h('line', { attrs: { x1: 0, y1: h_pad + y, x2: w_staff, y2: h_pad + y, 
                stroke: 'black', 'stroke-width': h_line_stroke  } })),
								symbol('gclef', h_half, y_center_staff - h_gclef * 0.58, h_gclef),
                symbol('time2', x_time, y_c - h_time, h_time),
                symbol('time2', x_time, y_f - h_time, h_time),
                ...note_stem(x_measure0, y_lb - h_whole, h_whole),
                ...note_stem(x_measure0 + w_bar5_3, y_lb - h_whole, h_whole),
                ...note_stem(x_measure0 + w_bar5_3 * 2, y_lb - h_whole, h_whole),
                ...TODO_line_bar(x_measure0 + w_bar5, y_go),
                ...TODO_double_line_bar(x_measure0 + 2 * w_bar5, y_go),
                ...note_stem(x_measure0 + x_bar5, y_lb - h_whole, h_whole),
                ...note_stem(x_measure0 + x_bar5 + w_bar5_3, y_lb - h_whole, h_whole),
                ...note_stem(x_measure0 + x_bar5 + w_bar5_3 * 2, y_lb - h_whole, h_whole),
                ...info_text(x_measure0, y_go - h_whole, w_bar5 * 2, 'Meter')
  ]
}


function info_text(x: number, y: number, w: number, text: string) {
  return [
    h('text', { attrs: { x: x, y: y, class: 'info' } }, text),
    h('line', { attrs: { x1: x, y1: y, x2: x, y2: y - w_half, stroke: 'black', 'stroke-width': h_line_stroke } }),
    h('line', { attrs: { x1: x + w, y1: y, x2: x + w, y2: y - w_half, stroke: 'black', 'stroke-width': h_line_stroke } }),
    h('line', { attrs: { x1: x, y1: y - w_half, x2: x + w, y2: y - w_half, stroke: 'black', 'stroke-width': h_line_stroke } }),
  ]
}

function TODO_line_bar(x: number, y: number) {
  return [h('line', { attrs: { x1: x, y1: y, x2: x, y2: y + h_lines - h_whole, stroke: 'black', 'stroke-width': h_line_stroke } })]
}

function TODO_double_line_bar(x: number, y: number) {
  return [
    ...TODO_line_bar(x, y),
    ...TODO_line_bar(x + h_half, y)
  ]
}

function note_stem(x: number, y: number, h: number) {
	return [
		symbol('note-half', x, y, h),
		stem(x + w_stem_stroke * 0.5, y + h_half, h_stem_height)
	]
}

function stem(x: number, y: number, height: number) {
 return h('line', { attrs: { x1: x, y1: y, x2: x, y2: y + height, stroke: 'black', 'stroke-width': w_stem_stroke } })
}

function symbol(id: string, x: number, y: number, height: number) {
    return h('use', { attrs: { preserveAspectRatio: 'xMinYMin', href: `#${id}`, fill: 'black', x, y, height } })
}

