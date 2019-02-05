import { ICanvasWorkerPostMessage } from 'lib/sharedInterfaces'

const ctx: Worker = self as any

/**
 * Data from the host
 */
let data: ICanvasWorkerPostMessage
/**
 * View into the shared ball data
 */
let ballsView: DataView
/**
 * View into the shared connection data
 */
let connsView: DataView

/**
 * Get offset to specific element at specific ball index
 * @param index Ball index
 * @param dataOffset Element offset
 */
const getBallDataOffset = (index: number, dataOffset: number): number =>
  (index * data.ballByteLength + dataOffset * data.elementByteLength)
/**
 * Get offset to specific element at specific connection index
 * @param index Connection index
 * @param dataOffset Element offset
 */
const getConnDataOffset = (index: number, dataOffset: number): number =>
  (index * Int32Array.BYTES_PER_ELEMENT * data.maxConns + dataOffset * Int32Array.BYTES_PER_ELEMENT)

/**
 * The worker message input
 */
ctx.onmessage = (event) => {
  data = event.data
  ballsView = new DataView(data.sab)
  connsView = new DataView(data.connsSab)

  // update loop
  setTimeout(update, 20)
}

const update = () => {
  for (let i = 0; i < data.batchSize; i++) {
    updateBall(i + data.startIndex)
  }
  setTimeout(update, 20)
}

const updateBall = (index: number) => {
  // get start values
  const x = ballsView.getFloat64(getBallDataOffset(index, 0), true)
  const y = ballsView.getFloat64(getBallDataOffset(index, 1), true)
  const velX = ballsView.getFloat64(getBallDataOffset(index, 2), true)
  const velY = ballsView.getFloat64(getBallDataOffset(index, 3), true)
  const size = ballsView.getFloat64(getBallDataOffset(index, 4), true)

  // Update velocity of the ball
  let newX = x + velX
  let newVelX = velX
  if (newX > data.width - size) {
    newVelX = -1 * velX
    newX = x + newVelX
  }
  if (newX < size) {
    newVelX = -1 * velX
    newX = x + newVelX
  }
  let newY = y + velY
  let newVelY = velY
  if (newY > data.height - size) {
    newVelY = -1 * velY
    newY = y + newVelY
  }
  if (newY < size) {
    newVelY = -1 * velY
    newY = y + newVelY
  }

  // check for in range
  const inRangePoints = []
  for (let i = 0; i < data.ballCount; i++) {
    const cX = ballsView.getFloat64(getBallDataOffset(i, 0), true)
    const cY = ballsView.getFloat64(getBallDataOffset(i, 1), true)
    const distance = Math.sqrt(Math.pow(cX - newX, 2) + Math.pow(cY - newY, 2))
    if (distance < data.maxDistance) {
      inRangePoints.push({ i, distance })
    }
  }

  // sort so that closest ball is first element and make the connection
  const sorted = inRangePoints.sort((a, b) => a.distance - b.distance)
  let connsCount = 0
  for (let i = 0; i < data.maxConns; i++) {
    if (sorted[i]) {
      connsView.setInt32(getConnDataOffset(index, connsCount), sorted[i].i, true)
    } else {
      connsView.setInt32(getConnDataOffset(index, connsCount), -1, true)
    }
    connsCount++
  }

  // update data
  ballsView.setFloat64(getBallDataOffset(index, 0), newX, true)
  ballsView.setFloat64(getBallDataOffset(index, 1), newY, true)
  ballsView.setFloat64(getBallDataOffset(index, 2), newVelX, true)
  ballsView.setFloat64(getBallDataOffset(index, 3), newVelY, true)
}
