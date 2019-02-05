import { clamp, getRandomNumber } from 'lib/math'
import { createShader, createShaderProgram } from 'lib/renderUtil'
import { IWebglWorkerCommandMessage, IWebglWorkerPostMessage } from 'lib/sharedInterfaces'
import 'styles/app.scss'
import Worker from 'worker-loader?name=webglWorkers/[name].[contenthash].w.js&publicPath=../!webglWorkers/worker'
import ballFrag from './shaders/ball.frag'
import ballVert from './shaders/ball.vert'
import connFrag from './shaders/conn.frag'
import connVert from './shaders/conn.vert'

/**
 * Common options for the app
 */
const options = {
  /**
   * Pause rendering
   */
  isPaused: false,

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

/**
 * Use little endian values in buffers
 */
const isLittleEndian = true

// worker
const workerPool: Worker[] = []
const workerCount = navigator.hardwareConcurrency || 4

// ball

let balls: Float32Array[]
let ballsSAB: SharedArrayBuffer
let ballBytes: number
const ballArrType = Float32Array
let connSAB: SharedArrayBuffer
const connArrType = Float32Array
const connElementCount = 4

// create canvas
/**
 * The canvas used for rendering
 */
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

/**
 * Width of the canvas
 */
let width = 0
/**
 * Height of the canvas
 */
let height = 0

/**
 * Resize the canvas
 */
const resize = () => {
  canvas.width = window.innerWidth || 500
  canvas.height = window.innerHeight || 500

  width = canvas.width
  height = canvas.height

  // update workers with the new size
  workerPool.forEach((w) => w.postMessage({ cmd: 'resize', width, height }))
}
resize()
// bind the window resize to the resize function
window.onresize = resize

// control functions
const run = () => {
  options.isPaused = false
  workerPool.forEach((w) => w.postMessage({ cmd: 'run' }))
  window.requestAnimationFrame(render)
}
const pause = () => {
  workerPool.forEach((w) => w.postMessage({ cmd: 'pause' }))
  options.isPaused = true
}

const setMaxConnDistance = (distance: number) => {
  workerPool.forEach((w) => w.postMessage({ cmd: 'distance', distance }))
}

const setMaxConns = (_maxConns: number) => {
  options.maxConns = _maxConns
  connSAB = new SharedArrayBuffer(options.maxConns * connArrType.BYTES_PER_ELEMENT * connElementCount * balls.length)
  workerPool.forEach((w) => w.postMessage({ cmd: 'maxConns', maxConns: options.maxConns, connSAB }))
}

// util functions
/**
 * Get offset to specific element at specific ball index
 * @param index Ball index
 * @param dataOffset Element offset
 */
const getBallDataOffset = (index: number, dataOffset: number) =>
  (index * ballBytes + dataOffset * ballArrType.BYTES_PER_ELEMENT)
/**
 * Get offset to specific element at specific connection index
 * @param index Connection index
 * @param dataOffset Element offset
 */
const getConnDataOffset = (index: number, dataOffset: number) =>
  (index * connArrType.BYTES_PER_ELEMENT * options.maxConns + dataOffset * connArrType.BYTES_PER_ELEMENT)

// ball generation and initialization

/**
 * Generate a new set of balls
 * @param ballCount Number of balls to generate in the new array
 */
const generateBalls = (ballCount: number) => Array.from(Array(ballCount)).map(() => {
  const size = getRandomNumber(3, 8)
  const maxSpeed = 2

  return new ballArrType([
    clamp(getRandomNumber(0, width), 0, width, size),
    clamp(getRandomNumber(0, height), 0, height, size),
    getRandomNumber(-maxSpeed, maxSpeed), getRandomNumber(-maxSpeed, maxSpeed),
    size
  ])
})

/**
 * Set the ball data to the new set of ball.
 * @param newBalls The new set of balls to use
 */
const setBalls = (newBalls: Float32Array[]) => {
  balls = newBalls
  ballBytes = balls[0].length * ballArrType.BYTES_PER_ELEMENT

  // initialize new buffers for balls and connections
  ballsSAB = new SharedArrayBuffer(balls.length * ballBytes)
  connSAB = new SharedArrayBuffer(options.maxConns * connArrType.BYTES_PER_ELEMENT * connElementCount * balls.length)

  // initialise the ball data buffer
  const ballsView = new DataView(ballsSAB)
  for (let i = 0; i < balls.length; i++) {
    ballsView.setFloat32(getBallDataOffset(i, 0), balls[i][0], isLittleEndian)
    ballsView.setFloat32(getBallDataOffset(i, 1), balls[i][1], isLittleEndian)
    ballsView.setFloat32(getBallDataOffset(i, 2), balls[i][2], isLittleEndian)
    ballsView.setFloat32(getBallDataOffset(i, 3), balls[i][3], isLittleEndian)
    ballsView.setFloat32(getBallDataOffset(i, 4), balls[i][4], isLittleEndian)
  }
  // intialize the connection data buffer
  const connsView = new DataView(connSAB)
  for (let i = 0; i < balls.length; i++) {
    for (let j = 0; j < options.maxConns; j++) {
      for (let d = 0; d < connElementCount; d++) {
        connsView.setFloat32(getConnDataOffset(i, j + d), -1, isLittleEndian)
      }
    }
  }
}

/**
 * Initialize the program
 */
const init = () => {
  setBalls(generateBalls(options.nBalls))

  initWorkers()
}

/**
 * Initialize the workers
 */
const initWorkers = () => {
  // bail if no balls or workerPool exists already
  if (workerPool.length > 0 || balls.length < 1) return

  const batchSize = Math.ceil(balls.length / workerCount)
  let nextIndex = 0
  let masterCreated = false
  for (let i = 0; i < workerCount; i++) {
    const worker = new Worker()

    const workerBatch = balls.length < batchSize + nextIndex ? balls.length - nextIndex : batchSize

    const post: IWebglWorkerPostMessage | IWebglWorkerCommandMessage = {
      ballArrByteLength: ballArrType.BYTES_PER_ELEMENT,
      ballByteLength: ballBytes,
      ballCount: options.nBalls,
      ballSAB: ballsSAB,
      batchSize: workerBatch,
      cmd: 'init',
      connArrByteLength: connArrType.BYTES_PER_ELEMENT,
      connByteLength: connArrType.BYTES_PER_ELEMENT * connElementCount,
      connElementCount,
      connSAB,
      height,
      isLittleEndian: true,
      master: !masterCreated,
      maxConns: options.maxConns,
      maxDistance: options.maxConnDistance,
      startIndex: nextIndex,
      width
    }

    worker.postMessage(post)
    masterCreated = true
    nextIndex += batchSize
    workerPool.push(worker)
  }
}

// rendering

/**
 * The graphics context to use
 */
const gl = canvas.getContext('webgl2', { antialias: true })

// ball shader program
const ballVertShader = createShader(gl, ballVert, gl.VERTEX_SHADER)
const ballFragShader = createShader(gl, ballFrag, gl.FRAGMENT_SHADER)
const ballShaderProgram = createShaderProgram(gl, ballVertShader, ballFragShader)
gl.linkProgram(ballShaderProgram)
const uLineWidthLocation = gl.getUniformLocation(ballShaderProgram, 'u_lineWidth')
const uWidthLocation = gl.getUniformLocation(ballShaderProgram, 'u_width')
const uHeightLocation = gl.getUniformLocation(ballShaderProgram, 'u_height')

// connection shader program
const connVertShader = createShader(gl, connVert, gl.VERTEX_SHADER)
const connFragShader = createShader(gl, connFrag, gl.FRAGMENT_SHADER)
const connShaderProgram = createShaderProgram(gl, connVertShader, connFragShader)
gl.linkProgram(connShaderProgram)
const uConnLineWidthLocation = gl.getUniformLocation(connShaderProgram, 'u_lineWidth')
const uConnWidthLocation = gl.getUniformLocation(connShaderProgram, 'u_width')
const uConnHeightLocation = gl.getUniformLocation(connShaderProgram, 'u_height')

const ballBuffer = gl.createBuffer()
const connBuffer = gl.createBuffer()

const POS_LOCATION = 0
const VEL_LOCATION = 1
const SIZE_LOCATION = 2

const CONN_LOCATION = 0

const updateBuffers = () => {
  gl.bindBuffer(gl.ARRAY_BUFFER, ballBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new ballArrType(ballsSAB), gl.DYNAMIC_DRAW, 0, balls.length * 5)

  gl.bindBuffer(gl.ARRAY_BUFFER, connBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new connArrType(connSAB),
    gl.DYNAMIC_DRAW,
    0,
    balls.length * options.maxConns * connElementCount
  )
}

const updateUniformsBalls = () => {
  gl.uniform1f(uLineWidthLocation, options.lineWidth || 2)
  gl.uniform1f(uWidthLocation, width)
  gl.uniform1f(uHeightLocation, height)
}

const updateUniformsConn = () => {
  gl.uniform1f(uConnLineWidthLocation, options.lineWidth || 2)
  gl.uniform1f(uConnWidthLocation, width)
  gl.uniform1f(uConnHeightLocation, height)
}

const render = () => {
  gl.viewport(0, 0, width, height)
  updateBuffers()

  gl.useProgram(ballShaderProgram)
  gl.enableVertexAttribArray(POS_LOCATION)
  gl.enableVertexAttribArray(VEL_LOCATION)
  gl.enableVertexAttribArray(SIZE_LOCATION)
  updateUniformsBalls()
  gl.bindBuffer(gl.ARRAY_BUFFER, ballBuffer)
  gl.vertexAttribPointer(POS_LOCATION, 2, gl.FLOAT, false, ballBytes, 0)
  gl.vertexAttribPointer(VEL_LOCATION, 2, gl.FLOAT, false, ballBytes, 2 * ballArrType.BYTES_PER_ELEMENT)
  gl.vertexAttribPointer(SIZE_LOCATION, 1, gl.FLOAT, false, ballBytes, 4 * ballArrType.BYTES_PER_ELEMENT)

  gl.drawArrays(gl.POINTS, 0, balls.length)

  gl.useProgram(connShaderProgram)
  updateUniformsConn()
  gl.enableVertexAttribArray(CONN_LOCATION)

  gl.bindBuffer(gl.ARRAY_BUFFER, connBuffer)
  gl.vertexAttribPointer(CONN_LOCATION, 2, gl.FLOAT, false, 0, 0)

  gl.drawArrays(gl.LINES, 0, balls.length * options.maxConns)

  if (!options.isPaused) {
    window.requestAnimationFrame(render)
  }
}

init()
run()
