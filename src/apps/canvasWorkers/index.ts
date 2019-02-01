import { clamp, getRandomNumber } from 'lib/math'
import { ICanvasWorkerPostMessage } from 'lib/sharedInterfaces'
import 'styles/app.scss'
import Worker from 'worker-loader?name=workers/[name].[contenthash].worker.js&publicPath=../!workers/canvasWorker'

/**
 * Common options for the app
 */
const options = {
  /**
   * Pause rendering
   */
  isPaused: false,
  /**
   * The maximum distance for the ball to be considered a valid connection target
   */
  maxConnDistance: 500,
  /**
   * Maximum ammount of connections to other balls made by the ball
   */
  maxConns: 2,
  /**
   * Number of balls
   */
  nBalls: 1000
}

// create canvas
/**
 * The canvas used for rendering
 */
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

/**
 * The graphics context to use
 */
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = true

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
}
resize()
// bind the window resize to the resize function
window.onresize = resize

/**
 * The ball data.
 *
 * Single ball: [xPos, yPos, velX, velY, size]
 */
const balls: Float64Array[] = Array.from(Array(options.nBalls)).map(() => {
  const size = getRandomNumber(3, 8)
  return new Float64Array([
    clamp(getRandomNumber(0, width), 0, width, size),
    clamp(getRandomNumber(0, height), 0, height, size),
    getRandomNumber(-5, 5), getRandomNumber(-5, 5),
    size
  ])
})

/**
 * Bytes per element
 */
const elementBytes = Float64Array.BYTES_PER_ELEMENT
/**
 * Bytes per ball
 */
const ballBytes = balls[0].length * elementBytes
/**
 * Ball data shared array buffer.
 */
const ballsSab = new SharedArrayBuffer(balls.length * ballBytes)

/**
 * Get offset to specific element at specific ball index
 * @param index Ball index
 * @param dataOffset Element offset
 */
const getBallDataOffset = (index: number, dataOffset: number): number =>
  (index * ballBytes + dataOffset * elementBytes)
/**
 * Get offset to specific element at specific connection index
 * @param index Connection index
 * @param dataOffset Element offset
 */
const getConnDataOffset = (index: number, dataOffset: number): number =>
  (index * Int32Array.BYTES_PER_ELEMENT * options.maxConns + dataOffset * Int32Array.BYTES_PER_ELEMENT)

// intialize the ball data
const ballsView = new DataView(ballsSab)
for (let i = 0; i < balls.length; i++) {
  ballsView.setFloat64(getBallDataOffset(i, 0), balls[i][0], true)
  ballsView.setFloat64(getBallDataOffset(i, 1), balls[i][1], true)
  ballsView.setFloat64(getBallDataOffset(i, 2), balls[i][2], true)
  ballsView.setFloat64(getBallDataOffset(i, 3), balls[i][3], true)
  ballsView.setFloat64(getBallDataOffset(i, 4), balls[i][4], true)
}

/**
 * The connection shared data buffer
 */
const connsSab = new SharedArrayBuffer(options.maxConns * Int32Array.BYTES_PER_ELEMENT * balls.length)

// intialize the connections data
const connsView = new DataView(connsSab)
for (let i = 0; i < balls.length; i++) {
  for (let j = 0; j < options.maxConns; j++) {
    connsView.setInt32(getConnDataOffset(i, j), -1, true)
  }
}

/**
 * Cached value for rendering a circle
 */
const circleAngle = Math.PI * 2

/**
 * The rendering function to draw all the balls and connection
 */
const render = () => {
  // Clear and set defaults
  ctx.clearRect(0, 0, width, height)
  ctx.lineWidth = 2
  ctx.fillStyle = '#000'

  // make a copy of the shared data so it doesn't change when we are rendering
  const connSnapShot = connsSab.slice(0)

  // render the balls
  for (let i = 0; i < balls.length; i++) {
    const curX = ballsView.getFloat64(getBallDataOffset(i, 0), true)
    const curY = ballsView.getFloat64(getBallDataOffset(i, 1), true)

    // render ball
    ctx.beginPath()
    ctx.moveTo(curX, curY)
    ctx.arc(curX, curY, ballsView.getFloat64(getBallDataOffset(i, 4), true), 0, circleAngle, false)
    ctx.fill()
    ctx.closePath()

    // render conns
    const conns = new Int32Array(connSnapShot, i * options.maxConns * Int32Array.BYTES_PER_ELEMENT, options.maxConns)
    for (const conn of conns) {
      if (conn !== -1) {
        ctx.beginPath()
        const connX = ballsView.getFloat64(getBallDataOffset(conn, 0), true)
        const connY = ballsView.getFloat64(getBallDataOffset(conn, 1), true)
        ctx.moveTo(curX, curY)
        ctx.lineTo(connX, connY)
        ctx.stroke()
        ctx.closePath()
      }
    }
  }

  // check for pause state or continue rendering
  if (!options.isPaused) {
    window.requestAnimationFrame(render)
  }
}

// start render loop
window.requestAnimationFrame(render)

// setup workers

/**
 * The number of workers to use
 */
const nWorkers = navigator.hardwareConcurrency || 4
/**
 * The workers in use
 */
const workerPool = []
/**
 * The size of the batch to give per worker
 */
const batchSize = Math.ceil(balls.length / nWorkers)

/**
 * The index of the end of last batch
 */
let nextIndex = 0
for (let i = 0; i < nWorkers; i++) {
  const worker = new Worker()

  const workerBatch = balls.length < batchSize + nextIndex ? balls.length - nextIndex : batchSize

  const post: ICanvasWorkerPostMessage = {
    ballByteLength: ballBytes,
    ballCount: options.nBalls,
    batchSize: workerBatch,
    connsSab,
    elementByteLength: elementBytes,
    height,
    maxConns: options.maxConns,
    maxDistance: options.maxConnDistance,
    sab: ballsSab,
    startIndex: nextIndex,
    width
  }

  worker.postMessage(post)
  nextIndex += batchSize
  workerPool.push(worker)
}
