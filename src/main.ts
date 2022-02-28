import './index.css'
import { init, styleModule, classModule, attributesModule } from 'snabbdom'

const patch = init([classModule, styleModule, attributesModule])

import Ctrl from './ctrl'
import view from './view'

import Input from './input'

import { Config, configure } from './config'

export default function app(_config: Partial<Config>, element: HTMLElement) {

  let config = configure(_config)

  let input = new Input()




  let ctrl = new Ctrl(input, config, redraw)

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
    ctrl.update(dt, dt0)
    
    dt0 = dt 
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step) 

  return {
  }
}

