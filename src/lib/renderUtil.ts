import { log } from 'lib/logger'

/**
 * Create a new shader
 * @param gl Graphics context
 * @param shaderSource Shader source code
 * @param type Shader type
 */
export const createShader = (gl: WebGL2RenderingContext, shaderSource: string, type: number): WebGLShader | null => {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    log(`An error has occured during compilation of shader: ${gl.getShaderInfoLog(shader)}`)
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * Create a new shader program
 * @param gl Graphics context
 * @param shaders Shaders to use in the program
 */
export const createShaderProgram = (gl: WebGL2RenderingContext, ...shaders: WebGLShader[]): WebGLProgram | null => {
  const program = gl.createProgram()
  shaders.forEach((shader) => gl.attachShader(program, shader))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    log(`Unable to initalize a shared program: ${gl.getProgramInfoLog(program)}`)
    return null
  }
  return program
}

export const createProgram2 = (
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  varyings?: string[],
  feedbackType?: number
): WebGLProgram => {
  const vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
  const fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)

  const program = gl.createProgram()
  gl.attachShader(program, vshader)
  gl.deleteShader(vshader)
  gl.attachShader(program, fshader)
  gl.deleteShader(fshader)

  // set only if feedback varying are defined
  if (varyings && varyings.length) {
    gl.transformFeedbackVaryings(program, varyings, feedbackType)
  }
  gl.linkProgram(program)

  // check status
  let gLog = gl.getProgramInfoLog(program)
  if (gLog) {
    log('Program Info: ', gLog)
    gl.deleteProgram(program)
    return null
  }

  gLog = gl.getShaderInfoLog(vshader)
  if (gLog) {
    log('Shader Info: ', gLog)
    gl.deleteProgram(program)
    return null
  }

  return program
}

export const createBuffer = (gl: WebGL2RenderingContext, data: number | ArrayBuffer, type: number): WebGLBuffer => {
  const buffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, type)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  return buffer
}

export interface IVertexArrayObject {
  buffer: WebGLBuffer,
  location: number,
  elementSize: number
}

export const createVAO = (gl: WebGL2RenderingContext, buffers: IVertexArrayObject[]): WebGLVertexArrayObject => {
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  buffers.forEach((buffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer)
    gl.enableVertexAttribArray(buffer.location)
    gl.vertexAttribPointer(buffer.location, buffer.elementSize, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
  })

  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindVertexArray(null)

  return vao
}
