import './index.css'
import './ui.css'
import { init, styleModule, classModule, attributesModule } from 'snabbdom'

const patch = init([classModule, styleModule, attributesModule])

import Ctrl from './ctrl'
import view from './view'

import Input from './input'
import Mouse from './mouse'

import { Config, configure } from './config'

import './_test'

export default function app(_config: Partial<Config>, element: HTMLElement) {

  let config = configure(_config)

  let input = new Input()
  let mouse = new Mouse()


  if (config.capture) {
    input.init()
    mouse.init()
  }

  let ctx = {
    input,
    mouse
  }

  let ctrl = new Ctrl(ctx)._set_data(config).init()

  const blueprint = view(ctrl)

  let vnode = patch(element, blueprint)

  function redraw() {
    vnode = patch(vnode, view(ctrl))
  }

  let fixed_dt = 1000/60
  let timestamp0: number | undefined,
    min_dt = fixed_dt,
    max_dt = fixed_dt * 2,
    dt0 = fixed_dt

  let elapsed = 0
  function step(timestamp: number) {

    let dt = timestamp0 ? timestamp - timestamp0 : fixed_dt

    dt = Math.max(min_dt, dt)
    dt = Math.min(max_dt, dt)

    input.update(dt, dt0)
    mouse.update(dt, dt0)
    ctrl.update(dt, dt0)

    if (ctrl._schedule_redraw) {
      ctrl._schedule_redraw = false
      redraw()
    }
    
    dt0 = dt 
    timestamp0 = timestamp
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step) 

  return {
    save() {
      return ctrl.save()
    },
    restore(data: string) {
      return ctrl.restore(data)
    }
  }
}

