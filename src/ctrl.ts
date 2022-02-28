import * as util from './util'
import { fen_music, uci_note } from './music'
import { Music } from './music'

import { Config } from './config'

import { FreeOnStaff } from './types'

export type Redraw = () => void

export default class Ctrl {


  frees: Array<FreeOnStaff>

  constructor(config: Config, readonly redraw: Redraw) {

    this.frees = config.frees || []

  }



}
