import { make_note, make_time_signature, is_tempo, is_note, is_rest } from './music'
import { BeatDivido } from './ctrl'

function is(a: any, b: any) {
  if (a !== b) {
    console.log(a, '!==', b)
  }
}

export default function run() {


  let d = new BeatDivido(make_time_signature(4, 2))

  d.add_measure()



  is(d.bmnrs.length, 4)
  is(d.bmnrs[0], rest_bm()


  console.log('pass')
}

run()
