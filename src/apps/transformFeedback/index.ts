import { Engine } from 'lib/engine'
import { log, time } from 'lib/logger'
import { createShader, createShaderProgram, createTransformFeedbackShaderProgram } from 'lib/renderUtil'
import ballFrag from './shaders/ball.frag'
import ballVert from './shaders/ball.vert'
import ballTFs from './shaders/ballTF.vert'
import connFrag from './shaders/conn.frag'
import connVert from './shaders/conn.vert'
import connTFs from './shaders/connTF.vert'
import dummyFrag from './shaders/dummy.frag'

import 'styles/app.scss'

// options
/**
 * Common options for the app
 */
const options = {
  /**
   * Pause rendering
   */
  isPaused: true,

  /**
   * Connection line width
   */
  lineWidth: 2,

  /**
   * The maximum distance for the ball to be considered a valid connection target
   */
  maxConnDistance: 200,

  /**
   * Maximum ammount of connections to other balls made by the ball
   */
  maxConns: 2,

  /**
   * Number of balls
   */
  nBalls: 1000
}

// const variables
/**
 * Use little endian values in buffers
 */
const isLittleEndian = true

// create canvas and add canvas
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

// rendering

interface IBallDrawUniforms {
  width: WebGLUniformLocation,
  height: WebGLUniformLocation
}
interface IBallAttribLocations {
  Position: number,
  Velocity: number,
  Size: number
}
interface IBallTFUniforms {
  width: WebGLUniformLocation,
  height: WebGLUniformLocation
}

interface IConnDrawUniforms {
  lineWidth: WebGLUniformLocation,
  width: WebGLUniformLocation,
  height: WebGLUniformLocation
}
interface IConnTFUniforms {
  width: WebGLUniformLocation,
  height: WebGLUniformLocation
}
interface IConnAttribLocations {
  Conn: number
}

interface IDrawDataObjects {
  ballDraw: IDrawData<IBallDrawUniforms, IBallAttribLocations>,
  ballTF: IDrawData<IBallTFUniforms, IBallAttribLocations>,
  connTF: IDrawData<IConnTFUniforms, IConnAttribLocations>,
  connDraw: IDrawData<IConnDrawUniforms, IConnAttribLocations>
}

interface IAttrib {
  location: number,
  size: number,
  type: number,
  normalized: boolean,
  stride: number,
  offset: number
}
interface IUniform {
  location: WebGLUniformLocation,
  uniformFunc: (location: WebGLUniformLocation,
                v0: number | Float32Array | number[] | Int32Array,
                v1?: number,
                v2?: number,
                v3?: number) => void,
  getter: () => number | Float32Array | number[] | Int32Array,
  srcOffset?: number,
  srcLength?: number
}

interface IVBO {
  program: WebGLProgram,
  uniforms: IUniform[],
  buffer: WebGLBuffer,
  jsBuffer: ArrayBuffer,
  length: number,
  drawType: number
  attribs: IAttrib[]
}

interface IDrawData<T, B> {
  program: WebGLProgram,
  uniforms: T,
  attribLocations: B,
  buffers: IVBO[]
}

class TransformFeedbackEngine extends Engine {

  private _drawData: IDrawDataObjects
  constructor (element: HTMLCanvasElement) {
    super(element)
    this._drawData = this.createDrawData()

    this.resize()
    this.isPaused = false
  }

  public draw (): void {
    this.drawBalls()
    this.drawConns()
  }

  public preRender (): void {
    // update balls
    this.gl.useProgram(this._drawData.ballTF.program)

    // update conns
    this.gl.useProgram(this._drawData.connTF.program)
  }

  public postRender (): void {
    // no action on post render
  }

  private createDrawData (): IDrawDataObjects {
    const ballVertShader = createShader(this.gl, ballVert, this.gl.VERTEX_SHADER)
    const ballFragShader = createShader(this.gl, ballFrag, this.gl.FRAGMENT_SHADER)
    const ballDrawProgram = createShaderProgram(this.gl, ballVertShader, ballFragShader)
    const ballDraw: IDrawData<IBallDrawUniforms, IBallAttribLocations> = {
      attribLocations: {
        Position: 0,
        Size: 2,
        Velocity: 1
      },
      program: ballDrawProgram,
      uniforms: {
        height: this.gl.getUniformLocation(ballDrawProgram, 'u_height'),
        width: this.gl.getUniformLocation(ballDrawProgram, 'u_width')
      }
    }

    const connVertShader = createShader(this.gl, connVert, this.gl.VERTEX_SHADER)
    const connFragShader = createShader(this.gl, connFrag, this.gl.FRAGMENT_SHADER)
    const connDrawProgram = createShaderProgram(this.gl, connVertShader, connFragShader)
    const connDraw: IDrawData<IConnDrawUniforms, IConnAttribLocations> = {
      attribLocations: {
        Conn: 0
      },
      program: connDrawProgram,
      uniforms: {
        height: this.gl.getUniformLocation(connDrawProgram, 'u_height'),
        lineWidth: this.gl.getUniformLocation(connDrawProgram, 'u_lineWidth'),
        width: this.gl.getUniformLocation(connDrawProgram, 'u_width')
      }
    }

    const ballTFShader = createShader(this.gl, ballTFs, this.gl.VERTEX_SHADER)
    const balldummyShader = createShader(this.gl, dummyFrag, this.gl.FRAGMENT_SHADER)
    const ballTFProgram = createTransformFeedbackShaderProgram(this.gl, ballTFShader, balldummyShader, []) // TODO

    const ballTF: IDrawData<IBallTFUniforms, IBallAttribLocations> = {
      attribLocations: {
        Position: 0,
        Size: 2,
        Velocity: 1
      },
      program: ballTFProgram,
      uniforms: {
        height: this.gl.getUniformLocation(ballTFProgram, 'u_height'),
        width: this.gl.getUniformLocation(ballTFProgram, 'u_width')
      }
    }
    const connTFShader = createShader(this.gl, connTFs, this.gl.VERTEX_SHADER)
    const conndummyShader = createShader(this.gl, dummyFrag, this.gl.FRAGMENT_SHADER)
    const connTFProgram = createTransformFeedbackShaderProgram(this.gl, connTFShader, conndummyShader, [])// TODO

    const connTF: IDrawData<IConnTFUniforms, IConnAttribLocations> = {
      attribLocations: {
        Conn: 0
      },
      program: connTFProgram,
      uniforms: {
        height: this.gl.getUniformLocation(connTFProgram, 'u_height'),
        width: this.gl.getUniformLocation(connTFProgram, 'u_width')
      }
    }

    return {
      ballDraw,
      ballTF,
      connDraw,
      connTF
    }
  }

  private drawBalls (): void {
    // program
    this.gl.useProgram(this._drawData.ballDraw.program)

    this.gl.enableVertexAttribArray(this._drawData.ballDraw.attribLocations.Position)
    this.gl.enableVertexAttribArray(this._drawData.ballDraw.attribLocations.Velocity)
    this.gl.enableVertexAttribArray(this._drawData.ballDraw.attribLocations.Size)

    // uniforms

    // bind buffer

    this.gl.vertexAttribPointer(this._drawData.ballDraw.attribLocations.Position, 2, this.gl.FLOAT, false, 2, 0) // TODO
    this.gl.vertexAttribPointer(this._drawData.ballDraw.attribLocations.Velocity, 2, this.gl.FLOAT, false, 2, 0) // TODO
    this.gl.vertexAttribPointer(this._drawData.ballDraw.attribLocations.Size, 1, this.gl.FLOAT, false, 2, 0) // TODO

    // draw

  }
  private drawConns (): void {
    // program
    this.gl.useProgram(this._drawData.connDraw.program)

    this.gl.enableVertexAttribArray(this._drawData.connDraw.attribLocations.Conn)
    // uniforms

    // bind buffer

    // draw
  }
}

const engine: TransformFeedbackEngine = new TransformFeedbackEngine(canvas)
