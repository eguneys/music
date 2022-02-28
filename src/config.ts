import { Fen } from './music'
import { FreeOnStaff } from './types'

export type Config = {
  fen: Fen,
  frees?: Array<FreeOnStaff>
}

let defaults = {
  fen: ""
}

export function configure(_config: Partial<Config>): Config {

  if (_config.fen) {
    _config.fen = _config.fen.trim()
  }

  return merge(defaults, _config)
}


export function merge(base: any, extend: any) {
  for (let key in base) {
    if (!extend[key]) {
      extend[key] = base[key]
    }
  }

  return extend
}
