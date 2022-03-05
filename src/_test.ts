import { make_note, make_time_signature, is_tempo, is_note, is_rest } from './music'
import { make_bm, make_bmnr } from './music'
import { BeatDivido } from './ctrl'

function is(a: any, b: any) {
  if (a !== b) {
    console.log(a, '!==', b)
  }
}

export default function run() {


  let d = new BeatDivido(make_time_signature(4, 2))

  d.add_measure()


  let w_beat = make_bm(0, 1, 0, 4),
    h_beat = w_beat / 2,
    q_beat = h_beat / 2


  is(d.bmnrs.length, 4)
  is(d.bmnrs[0], make_bmnr(w_beat, 2))

  //d.add_note(make_bm(0, 0, 0, 4), make_note(1, 4, 2))

  is(d.bmnrs.length, 4)
  is(d.bmnrs[0], make_bmnr(w_beat, make_note(1, 4, 2)))

  console.log('pass')
}

run()
