import { ClockFace } from 'apps/clock/clockFace'
import { ClockHand } from 'apps/clock/hand'
import { Webgl2Clock } from 'apps/clock/webgl2Clock'

export interface IWebgl2ClockRenderer {
  render: (gl: WebGL2RenderingContext) => void,
  update: (gl: WebGL2RenderingContext) => void,
  init: (gl: WebGL2RenderingContext) => void
}

export class Webgl2ClockRenderer {
  private readonly gl: WebGL2RenderingContext
  private _clockList: Array<Webgl2Clock<ClockFace,ClockHand,ClockHand,ClockHand>> = []

  constructor (context: WebGL2RenderingContext) {
    this.gl = context
  }

  public addClock (clock: Webgl2Clock<ClockFace,ClockHand,ClockHand,ClockHand>) {
    this._clockList.push(clock)
    clock.init()
  }

  public render (): void {
    this.renderSelf()
    // update
    this._clockList.forEach((clock) => clock.update())
    // render
    this._clockList.forEach((clock) => clock.render())
  }

  private renderSelf (): void {
    this.gl.clearColor(0.5, 0.5, 0.5, 1.0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
  }
}
