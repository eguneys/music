import { h, VNode } from 'snabbdom'
import Ctrl from './ctrl'
import g from './glyphs'

import { Clef, Music, Staff, Note, NotationOrNote, Notations, TimeSignature } from './music'
import { note_line, note_pitch, note_octave, note_duration, note_accidental } from './music'
import { time_nb_note_value, time_note_value } from './music'

export default function view(ctrl: Ctrl) {

  let music: any

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
  let { clef:  _clef, time: _time, notes } = staff
  let klef = (_clef === 1) ? 'gclef':'bclef'

  return h('div.staff-wrap.' + klef, [
    h('lines', [h('line'), h('line'), h('line'), h('line'), h('line')]),
    h('div.notation', [
      clef(ctrl, _clef),
      ...(_time ? time(ctrl, _time):[]),
      ...notes.flatMap((_, i) => notations(ctrl, _clef, _, i, notes.length))
    ])
  ])
}

let time_glyphs = {
  2: 'two',
  3: 'three',
  4: 'four',
  8: 'four',
  16: 'four',
  6: 'six',
  9: 'nine',
  10: 'ten',
  12: 'twelve'
}

function notations(ctrl: Ctrl, clef: Clef, notations: Notations, i: number, l: number) {
  if (Array.isArray(notations)) {
    return notations.map(_ => notation(ctrl, clef, _, i, l))
  }
  return notation(ctrl, clef,  notations, i, l)
}

let pitch_klasses = ['c', 'd', 'e', 'f', 'g', 'a', 'b']
let octave_klasses = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven']
let duration_klasses = ['dwhole', 'whole', 'half', 'quarter', 'eighth', 'sixteenth', 'thirtytwoth']
let accident_klasses = ['sharp', 'flat']

function note_klass(note: Note) {
  let pitch = note_pitch(note),
      octave = note_octave(note),
      duration = note_duration(note),
      accident = note_accidental(note)

  return [
    'pitch-' + pitch_klasses[pitch - 1],
    'octave-' + octave_klasses[octave - 1],
    'duration-' + duration_klasses[duration - 1],
    accident ? 'accident-' + accident_klasses[accident - 1] : 'natural',
  ].join('.')
}

let note_glyphs = [
  g.whole_note, 
  g.whole_note, 
  g.half_note, 
  g.whole_note, 
  g.whole_note, 
  g.whole_note, 
  g.whole_note, 
  g.whole_note, 
  g.whole_note, 
]
function notation(ctrl: Ctrl, clef: Clef, notation: NotationOrNote, i: number, l: number) {

  let x_measure = 6.15


  if (typeof notation === 'number') {
    let note = notation
    let duration = note_duration(note)
    console.log(duration, note_glyphs[duration - 1])
    return h('span.note.' + note_klass(note), style_transform(x_measure + (i/l) * 20, note_line(clef, notation)), note_glyphs[duration - 1])
  }

  let { text, note } = notation

  return h('span.regular.' + note_klass(note), regular_transform(x_measure + (i/l) * 20, note_line(clef, note!)), text)
}

function clef(ctrl: Ctrl, _clef: Clef) {
  let clef = _clef === 1 ? 'gclef' : 'bclef'

  let style

  if (clef === 'bclef') {
    style = style_transform(0, 4)
  } else {
    style = style_transform(0.15, 4)
  }
  return h('span.note.clef', style, g[clef])
}

function time(ctrl: Ctrl, time: TimeSignature) {
  let nb_note_value = time_nb_note_value(time),
    note_value = time_note_value(time)

  return [
    h('span.time.nb_note_value', regular_transform(2, 10), g[time_glyphs[nb_note_value] + '_time']),
    h('span.time.note_value', regular_transform(2, 8), g[time_glyphs[note_value] + '_time'])
  ]

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
