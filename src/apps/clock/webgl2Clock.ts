import { ClockHand } from 'apps/clock/hand'
import { ClassyHand } from 'apps/clock/hands'
import { IWebgl2ClockRenderer } from 'apps/clock/webgl2ClockRenderer'

export interface IWebgl2ClockOptions {
  width?: number,
  height?: number,
  x?: number,
  y?: number
}

interface IUniform {
  name: string,
  location?: WebGLUniformLocation,
  program?: WebGLProgram
}

interface IUniforms {
  xOffset: IUniform,
  yOffset: IUniform
}

export class Webgl2Clock implements IWebgl2ClockRenderer {
  private width: number
  private height: number
  private x: number
  private y: number

  private hourHand: ClockHand
  private minuteHand: ClockHand
  private secondHand: ClockHand

  private uniforms: IUniforms = {
    xOffset: {
      name: 'X_OFFSET'
    },
    yOffset: {
      name: 'Y_OFFSET'
    }
  }

  constructor (seedTime: number, options?: IWebgl2ClockOptions) {
    options = options || {}
    this.width = options.width || 0
    this.height = options.height || 0
    this.x = options.x || 0
    this.y = options.y || 0
  }

  public init (gl: WebGL2RenderingContext): void {
    if (this.width === 0 || this.height === 0) {
      this.width = gl.canvas.clientWidth
      this.height = gl.canvas.clientHeight
    }
    this.hourHand = new ClassyHand(gl, 50, 200)
    this.minuteHand = new ClassyHand(gl, 50, 300)
    this.secondHand = new ClassyHand(gl, 50, 350)

    this.initUniforms(gl)
    this.update(gl)
  }

  public update (gl: WebGL2RenderingContext): void {
    const now = new Date()
    this.hourHand.updateUniforms(this.x, this.y, -(now.getHours() / 12 * 360 + now.getMinutes() / 60 * 30))
    this.minuteHand.updateUniforms(this.x, this.y, -(now.getMinutes() / 60 * 360 + now.getSeconds() / 60 * 6))
    this.secondHand.updateUniforms(this.x, this.y, -(now.getSeconds() / 60 * 360 + now.getMilliseconds() / 1000 * 6))
    return
  }

  public render (gl: WebGL2RenderingContext): void {
    this.hourHand.draw(gl)
    this.minuteHand.draw(gl)
    this.secondHand.draw(gl)
    return
  }

  private initUniforms (gl: WebGL2RenderingContext): void {
    gl.useProgram(this.uniforms.xOffset.program)
    gl.uniform1f(this.uniforms.xOffset.location, this.x)

    gl.useProgram(this.uniforms.yOffset.program)
    gl.uniform1f(this.uniforms.yOffset.location, this.y)

    gl.useProgram(undefined)
  }
}
