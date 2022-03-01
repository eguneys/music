import * as util from './util'
import { fen_music, uci_note } from './music'
import { Music } from './music'

import { Config } from './config'
import Input from './input'

import { FreeOnStaff } from './types'

export type Redraw = () => void


let btn_pitches = [' ', 'j', 'k', 'l', ';', '\'', '\\']
let btn_pitches_octave_up = ['a', 's', 'd', 'f', 'g', 'h']


export default class Ctrl {

  frees: Array<FreeOnStaff>

  constructor(readonly input: Input, 
    readonly config: Config, 
    readonly redraw: Redraw) {

    this.frees = config.frees || []
  }


  update(dt: number, dt0: number) {

    btn_pitches.slice(0, 1).forEach((key, i) => {
      let x = this.input.btn(key),
        x0 = this.input.btn0(key)

      if (x > 0) {
      } else if (x < 0) {
        if (x0 > 0) {
          console.log(key, x0)
        }
      }
    })
  }


}
