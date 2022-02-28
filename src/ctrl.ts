import * as util from './util'
import { fen_music, uci_note } from './music'
import { Music } from './music'

import { Config } from './config'
import Input from './input'

import { FreeOnStaff } from './types'

export type Redraw = () => void

export default class Ctrl {

  frees: Array<FreeOnStaff>

  constructor(readonly input: Input, 
    readonly config: Config, 
    readonly redraw: Redraw) {

    this.frees = config.frees || []
  }


  update(dt: number, dt0: number) {
    console.log(this.input.btn('a'))
  }


}
