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

export const createResizer = (canvas: HTMLCanvasElement) => () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
