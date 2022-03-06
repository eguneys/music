export type MouchEvent = Event & Partial<MouseEvent & TouchEvent>
type Unbind = () => void


export function eventPosition(e: MouchEvent): [number, number] | undefined {
  if (e.clientX !== undefined && e.clientY !== undefined) {
    return [e.clientX, e.clientY]
  }
  if (e.targetTouches?.[0]) {
    return [e.targetTouches[0].clientX, e.targetTouches[0].clientY]
  }
}

export default class Mouse {

  x: number = 0
  y: number = 0
  c_end: number = 0
  c_end0?: number
  just_ended: boolean = false

  unbinds!: Array<Unbind>


  get click_end(): boolean {
    return this.c_end !== this.c_end0
  }

  init() {

    const onmove = (e: MouseEvent) => this.onmove(e)
    const onend = (e: MouseEvent) => this.onend(e)

    this.unbinds = []
    let { unbinds } = this

    for (const ev of ['touchmove', 'mousemove']) {
      unbinds.push(unbindable(document, ev, onmove as EventListener))
    }

    for (const ev of ['touchend', 'mouseup']) {
      unbinds.push(unbindable(document, ev, onend as EventListener))
    }

  }

  onmove(e: MouseEvent) {
    let p = eventPosition(e)
    if (p) {
      this.x = p[0]
      this.y = p[1]
    }
  }

  onend(e: MouseEvent) {
    this.just_ended = true
  }


  update(dt: number, dt0: number) {
    this.c_end0 = this.c_end
    if (this.just_ended) {
      this.just_ended = false
      this.c_end++;
    }
  }

  remove() {
    this.unbinds.forEach(_ => _())
  }

}


function unbindable(
  el: EventTarget,
  eventName: string,
  callback: EventListener,
  options?: AddEventListenerOptions): Unbind {
    el.addEventListener(eventName, callback, options)
    return () => el.removeEventListener(eventName, callback, options)
  }
