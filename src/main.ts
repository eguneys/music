import './index.css'
import { init, styleModule, classModule, attributesModule } from 'snabbdom'

const patch = init([classModule, styleModule, attributesModule])

import Ctrl from './ctrl'
import view from './view'

import { Config, configure } from './config'

export default function app(_config: Partial<Config>, element: HTMLElement) {

  let config = configure(_config)
  let ctrl = new Ctrl(config, redraw)

  const blueprint = view(ctrl)

  let vnode = patch(element, blueprint)

  function redraw() {
    vnode = patch(vnode, view(ctrl))
  }

  return {
  }
}

