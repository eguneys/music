import './index.css'
import { init, styleModule, classModule, attributesModule } from 'snabbdom'

const patch = init([classModule, styleModule, attributesModule])

import Ctrl from './ctrl'
import view from './view'

export default function app(element: HTMLElement) {

  let ctrl = new Ctrl(redraw)

  const blueprint = view(ctrl)

  let vnode = patch(element, blueprint)

  function redraw() {
    vnode = patch(vnode, view(ctrl))
  }

  return {
  }
}

