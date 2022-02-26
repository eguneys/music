import * as util from './util'

export type Redraw = () => void

export default class Ctrl {

  _bounds!: util.Memo<ClientRect>

  get bounds() { return this._bounds() }


  set_element(elm: HTMLElement) {
    this._bounds = util.memo(() =>
                             elm.getBoundingClientRect())
  }

  constructor(readonly redraw: Redraw) {
    this._bounds =  util.memo(() => document.body.getBoundingClientRect())

	}



}
