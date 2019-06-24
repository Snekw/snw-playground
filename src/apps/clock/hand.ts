import { createShader, createShaderProgram } from 'lib/renderUtil'

export abstract class ClockHand {
  protected abstract get vertShader (): string
  protected abstract get fragShader (): string
  public readonly program: WebGLProgram
  private readonly gl: WebGL2RenderingContext
  private readonly handData: Float32Array
  private readonly OffsetUniformLoc: WebGLUniformLocation
  private readonly OffsetUnifromName: string = 'OFFSET'
  private readonly rotationUniformLoc: WebGLUniformLocation
  private readonly rotationUniformName: string = 'ROTATION'
  private readonly drawBuffer: WebGLBuffer
  private readonly locCoord: number = 0
  private rotation: [number, number]

  constructor (gl: WebGL2RenderingContext, width: number, height: number) {
    this.gl = gl

    this.program = this.createShaderProgram(this.gl)
    this.gl.useProgram(this.program)
    this.OffsetUniformLoc = this.gl.getUniformLocation(this.program, this.OffsetUnifromName)
    this.rotationUniformLoc = this.gl.getUniformLocation(this.program, this.rotationUniformName)

    this.handData = this.generator(width, height)
    this.drawBuffer = this.createVertexBuffer(gl)
  }

  public updateUniforms (xOffset: number, yOffset: number, angle: number): void {
    this.gl.useProgram(this.program)
    this.gl.uniform2fv(this.OffsetUniformLoc, [xOffset, yOffset])
    const angleInRads = angle * Math.PI / 180
    this.rotation = [Math.sin(angleInRads), Math.cos(angleInRads)]

    this.gl.uniform2fv(this.rotationUniformLoc, this.rotation)
  }

  public draw (gl: WebGL2RenderingContext): void {
    gl.useProgram(this.program)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.drawBuffer)

    gl.vertexAttribPointer(this.locCoord, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.locCoord)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.handData.length / 2)

    gl.disableVertexAttribArray(this.locCoord)
  }

  protected abstract generator (width: number, height: number): Float32Array

  private createVertexBuffer (gl: WebGL2RenderingContext): WebGLBuffer {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.handData, gl.STATIC_DRAW, 0, this.handData.length)
    return buffer
  }

  private createShaderProgram (gl: WebGL2RenderingContext): WebGLProgram {
    const vertShader = createShader(gl, this.vertShader, gl.VERTEX_SHADER)
    const fragShader = createShader(gl, this.fragShader, gl.FRAGMENT_SHADER)
    return createShaderProgram(gl, vertShader, fragShader)
  }
}
