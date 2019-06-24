import { Webgl2Clock } from 'apps/clock/webgl2Clock'

export interface IWebgl2ClockRenderer {
  render: (gl: WebGL2RenderingContext) => void,
  update: (gl: WebGL2RenderingContext) => void,
  init: (gl: WebGL2RenderingContext) => void
}

export class Webgl2ClockRenderer {
  private readonly gl: WebGL2RenderingContext
  private _clockList: Webgl2Clock[] = []
  private _curTime: number

  constructor (context: WebGL2RenderingContext) {
    this.gl = context
  }

  public addClock (clock: Webgl2Clock) {
    this._clockList.push(clock)
    clock.init(this.gl)
  }

  public render (time: number): void {
    this._curTime += time
    this.renderSelf(this.gl)
    // update
    this._clockList.forEach((clock) => clock.update(this.gl))
    // render
    this._clockList.forEach((clock) => clock.render(this.gl))
  }

  private renderSelf (gl: WebGL2RenderingContext): void {
    gl.clearColor(0.5, 0.5, 0.5, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  }
}
