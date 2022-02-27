import * as util from './util'
import { fen_staff, uci_note } from './music'
import { Staff } from './music'

import { Config } from './config'

export type Redraw = () => void


export default class Ctrl {

  _bounds!: util.Memo<ClientRect>

  get bounds() { return this._bounds() }

  set_element(elm: HTMLElement) {
    this._bounds = util.memo(() =>
                             elm.getBoundingClientRect())
  }


  staff: Staff

  constructor(config: Config, readonly redraw: Redraw) {
    this._bounds =  util.memo(() => document.body.getBoundingClientRect())

    this.staff = fen_staff(config.fen)!
  }



}
