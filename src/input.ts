import { ticks } from './shared'

let RE = /^[A-Za-z0-9\+\-;']$/
let RE2 = /^(\s|Left|Right)$/
function capture_key(key: string) {
  return key.match(RE) || key.match(RE2)
}

function appr(value: number, target: number, dt: number)  {
  if (value < target) {
    return Math.min(value + dt, target)
  }else {
    return Math.max(value - dt, target)
  }
}
export default class Input {


  get left() {
    return this.btn('left')
  }

  get right() {
    return this.btn('right')
  }


  _btn = new Map()
  _btn0 = new Map()

  skip_update = false

  private press = (key: string) => {
    if (!this._btn.has(key) || this._btn.get(key) === 0) {
      this._btn0.set(key, this._btn.get(key))
      this._btn.set(key, ticks.one)
      this.skip_update = true
    }
  }


  private release = (key: string) => {
    if (this._btn.has(key) && this._btn.get(key) > 0) {
      this._btn0.set(key, this._btn.get(key))
      this._btn.set(key, -ticks.three)
      this.skip_update = true
    }
  }

  btn = (key: string) => {
    return this._btn.get(key) || 0
  }

  btn0 = (key: string) => {
    return this._btn0.get(key) || this.btn(key)
  }

  update = (dt: number, dt0: number) => {
    for (let [key, t] of this._btn) {
      if (t > 0) {
        t += dt
      } else if (t < 0) {
        t = appr(t, 0, dt)
      }
      if (!this.skip_update) {
        this._btn0.set(key, this._btn.get(key))
        this._btn.set(key, t)
      }
    }
    this.skip_update = false
  }

  init() {

    let { press, release } = this

    document.addEventListener('keydown', e => {
      if (e.ctrlKey || !capture_key(e.key)) {
        return
      }
      e.preventDefault()
      switch(e.key) {
        case 'ArrowUp':
          press('up');
          break;
        case 'ArrowDown':
          press('down');
          break;
        case 'ArrowLeft':
          press('left');
          break;
        case 'ArrowRight':
          press('right');
          break;
        default:
          press(e.key)
          break
      }
    });

    document.addEventListener('keyup', e => {
      if (e.ctrlKey || !capture_key(e.key)) {
        return
      }
      e.preventDefault()
      switch(e.key) {
        case 'ArrowUp':
          release('up');
          break;
        case 'ArrowDown':
          release('down');
          break;
        case 'ArrowLeft':
          release('left');
          break;
        case 'ArrowRight':
          release('right');
          break;
        default:
          release(e.key)
          break
      }
    });
  }
}
