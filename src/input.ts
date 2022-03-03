import { ticks } from './shared'

let RE = /^[A-Za-z0-9\+\-;'\\]$/
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

type ButtonState = {
  just_pressed: boolean,
  just_released: boolean,
  t: number,
  t0: number
}


export default class Input {


  get left() {
    return this.btn('left')
  }

  get right() {
    return this.btn('right')
  }


  _btn = new Map<string, ButtonState>()

  private press = (key: string) => {
    if (!this._btn.has(key)) {
      this._btn.set(key, {
        just_pressed: true,
        just_released: false,
        t: 0,
        t0: 0
      })
      return
    }
    this._btn.get(key)!.just_pressed = true
  }


  private release = (key: string) => {
    let res = this._btn.get(key)
    if (res) {
      res.just_released = true
    }
  }

  btn = (key: string) => {
    return this._btn.get(key)?.t || 0
  }

  btn0 = (key: string) => {
    return this._btn.get(key)?.t0 || 0
  }


  btnp = (key: string) => {
    return this.btn(key) > 0 && this.btn0(key) === 0
  }

  update = (dt: number, dt0: number) => {
    for (let [key, s] of this._btn) {
      if (s.just_pressed || s.t > 0) {
        s.t0 = s.t
        s.t += dt
        s.just_pressed = false
      }

      if (s.just_released) {
        s.t0 = s.t
        s.t = 0
        s.just_released = false
      }
    }
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
