import * as util from './util'
import { fen_music, uci_note } from './music'
import { Music } from './music'

import { Config } from './config'

export type Redraw = () => void


export default class Ctrl {

  _bounds!: util.Memo<ClientRect>

  get bounds() { return this._bounds() }

  set_element(elm: HTMLElement) {
    this._bounds = util.memo(() =>
                             elm.getBoundingClientRect())
  }


  music: Music

  constructor(config: Config, readonly redraw: Redraw) {
    this._bounds =  util.memo(() => document.body.getBoundingClientRect())

    this.music = fen_music(config.fen)!
  }



}
