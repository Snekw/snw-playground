import { IDrawable } from 'apps/clock/renderHelpers'
import { createShader, createShaderProgram } from 'lib/renderUtil'

export type ClockHandConstructor<T> = new (gl: WebGL2RenderingContext, width: number, height: number) => T

export abstract class ClockHand implements IDrawable {
  protected abstract get vertShader (): string
  protected abstract get fragShader (): string
  public readonly program: WebGLProgram
  private readonly gl: WebGL2RenderingContext
  private readonly handData: Float32Array
  private readonly OffsetUniformLoc: WebGLUniformLocation
  private readonly OffsetUnifromName: string = 'u_offset'
  private readonly rotationUniformLoc: WebGLUniformLocation
  private readonly rotationUniformName: string = 'u_rotation'
  private readonly resolutionUniformLoc: WebGLUniformLocation
  private readonly resolutionUniformName: string = 'u_resolution'
  private readonly drawBuffer: WebGLBuffer
  private readonly locCoord: number = 0
  private rotation: [number, number]

  constructor (gl: WebGL2RenderingContext, width: number, height: number) {
    this.gl = gl

    this.program = this.createShaderProgram()
    this.gl.useProgram(this.program)
    this.OffsetUniformLoc = this.gl.getUniformLocation(this.program, this.OffsetUnifromName)
    this.rotationUniformLoc = this.gl.getUniformLocation(this.program, this.rotationUniformName)
    this.resolutionUniformLoc = this.gl.getUniformLocation(this.program, this.resolutionUniformName)

    this.handData = this.generator(width, height)
    this.drawBuffer = this.createVertexBuffer()
  }

  public updateUniforms (xOffset: number, yOffset: number, angle: number): void {
    this.gl.useProgram(this.program)
    this.gl.uniform2fv(this.OffsetUniformLoc, [
      Math.round(this.gl.canvas.width / 2) + xOffset,
      Math.round(this.gl.canvas.height / 2) + yOffset
    ])
    this.gl.uniform2fv(this.resolutionUniformLoc, [this.gl.canvas.width, this.gl.canvas.height])
    const angleInRads = angle * Math.PI / 180
    this.rotation = [Math.sin(angleInRads), Math.cos(angleInRads)]

    this.gl.uniform2fv(this.rotationUniformLoc, this.rotation)
  }

  public draw (): void {
    this.gl.useProgram(this.program)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.drawBuffer)

    this.gl.vertexAttribPointer(this.locCoord, 2, this.gl.FLOAT, false, 0, 0)
    this.gl.enableVertexAttribArray(this.locCoord)

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.handData.length / 2)

    this.gl.disableVertexAttribArray(this.locCoord)
  }

  protected abstract generator (width: number, height: number): Float32Array

  private createVertexBuffer (): WebGLBuffer {
    const buffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.handData, this.gl.STATIC_DRAW, 0, this.handData.length)
    return buffer
  }

  private createShaderProgram (): WebGLProgram {
    const vertShader = createShader(this.gl, this.vertShader, this.gl.VERTEX_SHADER)
    const fragShader = createShader(this.gl, this.fragShader, this.gl.FRAGMENT_SHADER)
    return createShaderProgram(this.gl, vertShader, fragShader)
  }
}
