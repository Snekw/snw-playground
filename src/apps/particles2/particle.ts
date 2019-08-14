import { IVec2 } from 'lib/math'
import {
  createBuffer,
  createProgram2,
  createVAO
} from 'lib/renderUtil'

const VERTEX_ATTRIB_POS = 0
const VELOCITY_ATTRIB_POS = 1
const LIFE_ATTRIB_POS = 2

export class ParticleSystem {
  private readonly gl: WebGL2RenderingContext
  private readonly transformProgram: WebGLProgram

  public constructor (
    gl: WebGL2RenderingContext,
    transformShaderStr: string,
    fragmentShader: string
  ) {
    this.gl = gl

    this.transformProgram = createProgram2(
      gl,
      transformShaderStr,
      fragmentShader,
      ['v_position', 'v_velocity', 'v_life'],
      this.gl.SEPARATE_ATTRIBS
    )
  }

  public generate (nParticles: number, location: IVec2): Particle {
    return new Particle(this.gl, this.transformProgram, nParticles, location)
  }
}

// tslint:disable-next-line: max-classes-per-file
export class Particle {

  private static generateVertexBuffers (
    gl: WebGL2RenderingContext,
    nParticles: number,
    location: IVec2
  ): WebGLBuffer[] {
    const particleArrLength = nParticles * 2 * 4
    // particle arr format:
    const particleArr = new Float32Array(particleArrLength)
    let i = particleArrLength - 1
    for (; i > 0; i -= 2) {
      particleArr[i] = location.y
      particleArr[i - 1] = location.x
    }

    return [
      createBuffer(gl, particleArr, gl.DYNAMIC_COPY),
      createBuffer(gl, particleArrLength, gl.DYNAMIC_COPY)
    ]
  }

  private static generateVelocityBuffers (gl: WebGL2RenderingContext, nParticles: number): WebGLBuffer[] {
    const particleArrLength = nParticles * 2 * 4
    // particle arr format:
    const particleArr = new Float32Array(particleArrLength)
    let i = particleArrLength - 1
    for (; i > 0; i -= 2) {
      const x = (0.5 - Math.random()) * 0.01
      const y = (0.5 - Math.random()) * 0.01
      const magnitude = Math.sqrt(x * x + y * y)
      particleArr[i] = x / magnitude * 0.001 * Math.random() * 2
      particleArr[i - 1] = y / magnitude * 0.001 * Math.random() * 2
    }

    return [
      createBuffer(gl, particleArr, gl.DYNAMIC_COPY),
      createBuffer(gl, particleArrLength, gl.DYNAMIC_COPY)
    ]
  }

  private static generateLifeBuffers (gl: WebGL2RenderingContext, nParticles: number): WebGLBuffer[] {
    const particleArrLength = nParticles * 4
    // particle arr format:
    const particleArr = new Float32Array(particleArrLength)
    let i = particleArrLength - 1
    for (; i > 0; i -= 1) {
      particleArr[i] = Math.random() * 2
    }

    return [
      createBuffer(gl, particleArr, gl.DYNAMIC_COPY),
      createBuffer(gl, particleArrLength, gl.DYNAMIC_COPY)
    ]
  }

  private readonly gl: WebGL2RenderingContext
  private readonly transformProgram: WebGLProgram
  private readonly nParticles: number
  private readonly vertexBuffers: WebGLBuffer[]
  private readonly velocityBuffers: WebGLBuffer[]
  private readonly lifeBuffers: WebGLBuffer[]
  private readonly fb: WebGLTransformFeedback
  private readonly feedBackVAOs: WebGLVertexArrayObject[]
  private readonly uDelta: WebGLUniformLocation
  private currentIndex: number = 0

  public constructor (
    gl: WebGL2RenderingContext,
    transformProgram: WebGLProgram,
    nParticles: number,
    location: IVec2
  ) {
    this.gl = gl
    this.transformProgram = transformProgram

    this.nParticles = nParticles

    this.vertexBuffers = Particle.generateVertexBuffers(this.gl, this.nParticles, location)
    this.velocityBuffers = Particle.generateVelocityBuffers(this.gl, this.nParticles)
    this.lifeBuffers = Particle.generateLifeBuffers(this.gl, this.nParticles)
    this.fb = this.gl.createTransformFeedback()

    this.uDelta = this.gl.getUniformLocation(this.transformProgram, 'u_delta')

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
        },
        {
          buffer: this.lifeBuffers[0],
          location: LIFE_ATTRIB_POS,
          elementSize: 1
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
        },
        {
          buffer: this.lifeBuffers[1],
          location: LIFE_ATTRIB_POS,
          elementSize: 1
        }
      ])
    ]
  }

  public destroy () {
    this.feedBackVAOs.forEach((f) => this.gl.deleteVertexArray(f))
    this.velocityBuffers.forEach((b) => this.gl.deleteBuffer(b))
    this.vertexBuffers.forEach((b) => this.gl.deleteBuffer(b))
    this.gl.deleteTransformFeedback(this.fb)
  }

  public update (delta: number) {
    const invertedIndex = this.currentIndex === 1 ? 0 : 1

    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.fb)

    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.vertexBuffers[invertedIndex])
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.velocityBuffers[invertedIndex])
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.lifeBuffers[invertedIndex])

    this.gl.useProgram(this.transformProgram)

    this.gl.uniform1f(this.uDelta, delta / 10)

    this.gl.beginTransformFeedback(this.gl.POINTS)
    this.gl.bindVertexArray(this.feedBackVAOs[this.currentIndex])
    this.gl.drawArrays(this.gl.POINTS, 0, this.nParticles)
    this.gl.endTransformFeedback()

    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 1, null)
    this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 2, null)
    this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null)

    this.currentIndex = invertedIndex
  }
}
