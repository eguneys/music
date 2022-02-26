import { h } from 'snabbdom'
import * as ds from './ds'

const note_half = h('symbol', { attrs: {
  id: 'note-half',
	preserveAspectRatio: 'xMinYMin',
  viewBox: '0 0 7.1694312 5.8515377'
} }, [
	/*h('rect', { attrs: { width: '100%', height: '100%', fill: 'red' } }),*/
	h('path', { attrs: {
		transform: 'translate(-110.34759,-151.57067)',
		d: ds.note_half_d,
		'stroke-width': '0.264583'
	}})
])

const time2 = h('symbol', { attrs: {
  id: 'time2',
  preserveAspectRatio: 'xMinYMin',
	viewBox: '0 0 8.3003483 11.213757',
} }, [
  /*h('rect', { attrs: { width: '100%', height: '100%', fill: 'red' } })*/
  h('path', { attrs: {
		transform: "translate(-88.618234,-62.823049)",
    d: ds.time2_d, 
    'stroke-width': '0.826876',
		'fill-rule': 'nonzero',
		'vector-effect': 'non-scaling-stroke'
  }})
])

// TODO normalize svg
const gclef = h('symbol', { attrs: { 
  id: 'gclef',
  preserveAspectRatio: 'xMinYMin',
  viewBox:"36.16 204.35 284.921 811.583" 
} }, [
 /* h('rect', { attrs: { width: '100%', height: '100%', fill: 'red' } }), */
  h('path', { attrs: { 
  d: ds.gclef_d, 'stroke-width':"0.602291", stroke:"black", 'fill-rule':"evenodd" } })
  ])


export default [
  gclef,
  time2,
  note_half
]

