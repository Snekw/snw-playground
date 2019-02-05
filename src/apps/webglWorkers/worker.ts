import { log } from 'lib/logger'
import { IWebglWorkerCommandMessage, IWebglWorkerPostMessage } from 'lib/sharedInterfaces'

let data: IWebglWorkerPostMessage & IWebglWorkerCommandMessage
let ballsView: DataView
let connsView: DataView
const getBallDataOffset = (index: number, dataOffset: number) =>
  (index * data.ballByteLength + dataOffset * data.ballArrByteLength)
const getConnDataOffset = (index: number, dataOffset: number) =>
  (index * data.connByteLength * maxConns + dataOffset * data.connArrByteLength)
let maxDistance = 100
let maxConns: number
let paused = false

onmessage = (e: MessageEvent) => {
  if (e.data.master) {
    log(e)
  }
  switch (e.data.cmd) {
    case 'init':
      paused = false
      data = e.data as IWebglWorkerPostMessage & IWebglWorkerCommandMessage
      ballsView = new DataView(data.ballSAB)
      connsView = new DataView(data.connSAB)
      maxConns = data.maxConns
      break
    case 'resize':
      data.width = e.data.width
      data.height = e.data.height
      break
    case 'run':
      paused = false
      setTimeout(update, 1)
      break
    case 'pause':
      paused = true
      break
    case 'distance':
      maxDistance = e.data.distance
      break
    case 'maxConns':
      maxConns = e.data.maxConns
      connsView = new DataView(e.data.connSAB)
      break
    default:
      if (e.data.master) {
        log(`Unknown cmd: ${e.data.cmd}`)
      }
  }
}

const update = () => {
  for (let i = 0; i < data.batchSize; i++) {
    updateBall(i + data.startIndex)
  }
  if (!paused) {
    setTimeout(update, 30)
  }
}

const updateBall = (index: number) => {
  const x = ballsView.getFloat32(getBallDataOffset(index, 0), data.isLittleEndian)
  const y = ballsView.getFloat32(getBallDataOffset(index, 1), data.isLittleEndian)
  const velX = ballsView.getFloat32(getBallDataOffset(index, 2), data.isLittleEndian)
  const velY = ballsView.getFloat32(getBallDataOffset(index, 3), data.isLittleEndian)
  const size = ballsView.getFloat32(getBallDataOffset(index, 4), data.isLittleEndian)

  let newX = x + velX
  let newVelX = velX
  if (newX > data.width - size) {
    newVelX = -1 * velX
    newX = data.width - size
  }
  if (newX < size) {
    newVelX = -1 * velX
    newX = x + newVelX
  }
  let newY = y + velY
  let newVelY = velY
  if (newY > data.height - size) {
    newVelY = -1 * velY
    newY = data.height - size
  }
  if (newY < size) {
    newVelY = -1 * velY
    newY = y + newVelY
  }

  const inRangePoints = []
  for (let i = 0; i < data.ballCount; i++) {

    // const conns = new Int32Array(data.connsSab, i * maxConns * Int32Array.BYTES_PER_ELEMENT, maxConns)
    // if(conns.indexOf(i)>-1){
    //     // connsView.setInt32(getConnDataOffset(index, connsCount), i, true)
    //     // connsCount++
    //     continue
    // }
    const cX = ballsView.getFloat32(getBallDataOffset(i, 0), data.isLittleEndian)
    const cY = ballsView.getFloat32(getBallDataOffset(i, 1), data.isLittleEndian)
    if (Math.abs(newX - cX) < maxDistance && Math.abs(newY - cY) < maxDistance) {
      const distance = Math.sqrt(Math.pow(cX - newX, 2) + Math.pow(cY - newY, 2))
      if (distance < maxDistance) {
        inRangePoints.push({ i, distance, cX, cY, newX, newY })
      }
    }
  }

  const sorted = inRangePoints.sort((a, b) => a.distance - b.distance)
  let connsCount = 0
  for (let i = 0; i < maxConns; i++) {
    if (sorted[i]) {
      connsView.setFloat32(
        getConnDataOffset(index, connsCount * data.connElementCount),
        sorted[i].newX,
        data.isLittleEndian
      )
      connsView.setFloat32(getConnDataOffset(
        index, connsCount * data.connElementCount + 1),
        sorted[i].newY,
        data.isLittleEndian
      )
      connsView.setFloat32(
        getConnDataOffset(index, connsCount * data.connElementCount + 2),
        sorted[i].cX,
        data.isLittleEndian
      )
      connsView.setFloat32(
        getConnDataOffset(index, connsCount * data.connElementCount + 3),
        sorted[i].cY,
        data.isLittleEndian
      )
    } else {
      connsView.setFloat32(getConnDataOffset(index, connsCount * data.connElementCount), -1, data.isLittleEndian)
      connsView.setFloat32(getConnDataOffset(index, connsCount * data.connElementCount + 1), -1, data.isLittleEndian)
      connsView.setFloat32(getConnDataOffset(index, connsCount * data.connElementCount + 2), -1, data.isLittleEndian)
      connsView.setFloat32(getConnDataOffset(index, connsCount * data.connElementCount + 3), -1, data.isLittleEndian)
    }
    connsCount++
  }

  ballsView.setFloat32(getBallDataOffset(index, 0), newX, data.isLittleEndian)
  ballsView.setFloat32(getBallDataOffset(index, 1), newY, data.isLittleEndian)
  ballsView.setFloat32(getBallDataOffset(index, 2), newVelX, data.isLittleEndian)
  ballsView.setFloat32(getBallDataOffset(index, 3), newVelY, data.isLittleEndian)
}
