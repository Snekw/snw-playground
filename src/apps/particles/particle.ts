import {
  createBuffer,
  createProgram2,
  createVAO
} from 'lib/renderUtil'
import blankFragmentShader from './shaders/blank.frag'

const VERTEX_ATTRIB_POS = 0
const VELOCITY_ATTRIB_POS = 1

export class ParticleSystem {
  private readonly gl: WebGL2RenderingContext
  private readonly transformProgram: WebGLProgram
  private readonly drawProgram: WebGLProgram

  public constructor (
    gl: WebGL2RenderingContext,
    transformShaderStr: string,
    vertexShaderStr: string,
    fragmentShader: string
  ) {
    this.gl = gl

    this.transformProgram = createProgram2(
      gl,
      transformShaderStr,
      blankFragmentShader,
      ['v_position', 'v_velocity'],
      this.gl.SEPARATE_ATTRIBS
    )

    this.drawProgram = createProgram2(
      gl,
      vertexShaderStr,
      fragmentShader
    )
  }

  public generate (nParticles: number): Particle {
    return new Particle(this.gl, this.transformProgram, this.drawProgram, nParticles)
  }
}

// tslint:disable-next-line: max-classes-per-file
export class Particle {

  private static generateVertexBuffers (gl: WebGL2RenderingContext, nParticles: number): WebGLBuffer[] {
    const particleArrLength = nParticles * 2 * 4
    // particle arr format:
    const particleArr = new Float32Array(particleArrLength)
    let i = particleArrLength - 1
    for (; i > 0; i -= 2) {
      particleArr[i] = 0.5 - Math.random()
      particleArr[i - 1] = 0.5 - Math.random()
    }

    return [
      createBuffer(gl, particleArr, gl.DYNAMIC_COPY),
      createBuffer(gl, particleArrLength, gl.DYNAMIC_COPY)
    ]
  }
  private static generateVelocityBuffers (gl: WebGL2RenderingContext, nParticles: number): WebGLBuffer[] {
    return Particle.generateVertexBuffers(gl, nParticles)
  }

  // private static createVertexArrays (gl: WebGL2RenderingContext, vertexBuffer) {
  //   const vertexBuffer = new Float32Array(100)

  //   const va1 = createVAO([{

  //   }])

  //   const va2 = gl.createVertexArray()

  //   return [va1, va2]
  // }

  private readonly gl: WebGL2RenderingContext
  private readonly transformProgram: WebGLProgram
  private readonly drawProgram: WebGLProgram
  private readonly nParticles: number
  private readonly vertexBuffers: WebGLBuffer[]
  private readonly velocityBuffers: WebGLBuffer[]
  private readonly fb: WebGLTransformFeedback
  private readonly feedBackVAOs: WebGLVertexArrayObject[]
  private readonly drawVAOs: WebGLVertexArrayObject[]
  private currentIndex: number = 0

  public constructor (
    gl: WebGL2RenderingContext,
    transformProgram: WebGLProgram,
    drawProgram: WebGLProgram,
    nParticles: number
  ) {
    this.gl = gl
    this.transformProgram = transformProgram
    this.drawProgram = drawProgram

    this.nParticles = nParticles

    this.vertexBuffers = Particle.generateVertexBuffers(this.gl, this.nParticles)
    this.velocityBuffers = Particle.generateVelocityBuffers(this.gl, this.nParticles)
    this.fb = this.gl.createTransformFeedback()

    this.feedBackVAOs = [
      createVAO(this.gl, [
        {
          buffer: this.vertexBuffers[0],
          location: VERTEX_ATTRIB_POS,
          elementSize: 2
        },
        {
          buffer: this.velocityBuffers[0],
          location: VELOCITY_ATTRIB_POS,
          elementSize: 2
        }
      ]),
      createVAO(this.gl, [
        {
          buffer: this.vertexBuffers[1],
          location: VERTEX_ATTRIB_POS,
          elementSize: 2
        },
        {
          buffer: this.velocityBuffers[1],
          location: VELOCITY_ATTRIB_POS,
          elementSize: 2
        }
      ])
    ]

    this.drawVAOs = [
      createVAO(this.gl, [
        {
          buffer: this.vertexBuffers[0],
          location: VERTEX_ATTRIB_POS,
          elementSize: 2
        }
      ]),
      createVAO(this.gl, [
        {
          buffer: this.vertexBuffers[1],
          location: VERTEX_ATTRIB_POS,
          elementSize: 2
        }
      ])
    ]
  }

  public update () {

    const invertedIndex = this.currentIndex === 1 ? 0 : 1

    this.gl.enable(this.gl.RASTERIZER_DISCARD)

    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.fb)

    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[invertedIndex])
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.velocityBuffers[invertedIndex])

    this.gl.useProgram(this.transformProgram)

    this.gl.beginTransformFeedback(this.gl.POINTS)
    this.gl.bindVertexArray(this.feedBackVAOs[this.currentIndex])
    this.gl.drawArrays(this.gl.POINTS, 0, this.nParticles)
    this.gl.endTransformFeedback()

    this.gl.disable(this.gl.RASTERIZER_DISCARD)

    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 1, null)
    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null)
  }

  public draw () {
    const invertedIndex = this.currentIndex === 1 ? 0 : 1

    this.gl.useProgram(this.drawProgram)
    this.gl.bindVertexArray(this.drawVAOs[invertedIndex])
    this.gl.drawArrays(this.gl.POINTS, 0, this.nParticles)
    this.gl.bindVertexArray(null)
    this.currentIndex = invertedIndex
  }
}
