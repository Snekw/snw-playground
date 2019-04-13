import { log } from 'lib/logger'
import 'styles/app.scss'

/***************** PARAMS *****************/
const gridWidth = 20
let pixelSize = 10

/***************** CANVAS *****************/
const canvas: HTMLCanvasElement = document.createElement('canvas')
canvas.tabIndex = 0
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

document.body.appendChild(canvas)

function resize () {
  canvas.width = window.innerHeight > window.innerWidth ? window.innerWidth : window.innerHeight
  canvas.height = canvas.width

  pixelSize = canvas.width / gridWidth
}
resize()
window.addEventListener('resize', resize)

/***************** STATE ******************/
/**
 * Direction
 */
interface IDirections {
  LEFT: ICoordinate,
  RIGHT: ICoordinate,
  UP: ICoordinate,
  DOWN: ICoordinate
}
const direction: IDirections = {
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 }
}
/**
 * Game state type
 */
interface IGameState {
  score: number,
  snake: ISnake,
  lastInput: action,
  lastDirection: ICoordinate,
  lastWasOrb: boolean,
  orb?: ICoordinate,
  gameOver: boolean
}
/**
 * Snake
 */
interface ISnake {
  headLocation: ICoordinate,
  locations: ICoordinate[]
}

interface ICoordinate {
  x: number,
  y: number
}

interface IEngineKeyBind {
  [key: string]: action
}
type KeyBinding = [action, ...string[]]

enum action {
  UP = 1,
  DOWN = 2,
  LEFT = 3,
  RIGHT = 4,
  ACTION = 5
}

const keybindings: KeyBinding[] = [
  [action.UP, 'w', 'W', 'ArrowUp'],
  [action.DOWN, 's', 'S', 'ArrowDown'],
  [action.LEFT, 'a', 'A', 'ArrowLeft'],
  [action.RIGHT, 'd', 'D', 'ArrowRight'],
  [action.ACTION, ' ', 'Enter']
]

const headPos: ICoordinate = { x: Math.round(gridWidth / 2), y: Math.round(gridWidth / 2) }
let gameState: IGameState = initGameState()

function initGameState (): IGameState {
  return {
    score: 0,
    snake: {
      headLocation: { x: headPos.x, y: headPos.y },
      locations: [
        { x: headPos.x, y: headPos.y },
        { x: headPos.x - 1, y: headPos.y },
        { x: headPos.x - 2, y: headPos.y }
      ]
    },
    lastInput: action.RIGHT,
    lastDirection: direction.RIGHT,
    lastWasOrb: false,
    gameOver: false
  }
}

/***************** RENDERING **************/
function render (delta: number) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#2a2a2a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // draw snake
  ctx.fillStyle = '#f00'
  gameState.snake.locations.forEach((element) => drawSnakePart(element))

  // draw orb
  if (gameState.orb) {
    ctx.fillStyle = '#0f0'
    const adjX = gameState.orb.x * pixelSize + pixelSize / 2
    const adjY = gameState.orb.y * pixelSize + pixelSize / 2
    ctx.beginPath()
    ctx.arc(adjX, adjY, pixelSize / 2 - pixelSize * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // draw score
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.font = '40px monospace'
  ctx.fillText(gameState.score.toString(), 5, 30)

  if (gameState.gameOver) {
    // highlight collision
    drawSnakePart(gameState.snake.headLocation, '#fca80c')

    // shadow
    ctx.fillStyle = '#2a2a2ab0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // text
    ctx.fillStyle = '#f00'
    ctx.font = '80px monospace'
    const gameOverText = 'Game Over!'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(gameOverText, canvas.width / 2, canvas.height / 2)
  }
}

function drawSnakePart (coord: ICoordinate, style: string = '#f00') {
  ctx.fillStyle = style
  const adjX = coord.x * pixelSize + pixelSize * 0.01
  const adjY = coord.y * pixelSize + pixelSize * 0.01
  ctx.fillRect(adjX, adjY, pixelSize * 0.98, pixelSize * 0.98)
}

/***************** GAME LOOP **************/
function update (delta: number) {
  DEBUG && log('Last action: ', gameState.lastInput)

  if (gameState.gameOver) {
    // allow restart on action
    if (gameState.lastInput === action.ACTION) {
      gameState = initGameState()
    }
    return
  }

  move()

  orb()

  collision()
}

function testSnakeCollision (coord: ICoordinate, skipHead: boolean = false): boolean {
  return !gameState.snake.locations.every(
    (v, i) => ((skipHead === true && i === 0) || !(v.x === coord.x && v.y === coord.y))
  )
}

function collision () {
  const head = gameState.snake.headLocation
  // self collsion
  if (testSnakeCollision(head, true)) {
    gameState.gameOver = true
  }

  // out of bounds
  if (head.x < 0 || head.y < 0 || head.x >= gridWidth || head.y >= gridWidth) {
    gameState.gameOver = true
  }
  if (gameState.gameOver) {
    gameState.lastInput = action.RIGHT
  }
}

function move () {
  let currDirection: ICoordinate = gameState.lastDirection
  switch (gameState.lastInput) {
    case action.UP:
      if (gameState.lastDirection.y !== direction.DOWN.y) {
        currDirection = direction.UP
      }
      break
    case action.DOWN:
      if (gameState.lastDirection.y !== direction.UP.y) {
        currDirection = direction.DOWN
      }
      break
    case action.LEFT:
      if (gameState.lastDirection.x !== direction.RIGHT.x) {
        currDirection = direction.LEFT
      }
      break
    case action.RIGHT:
      if (gameState.lastDirection.x !== direction.LEFT.x) {
        currDirection = direction.RIGHT
      }
      break
  }
  gameState.lastDirection = currDirection
  const newLocation = {
    x: gameState.snake.headLocation.x + currDirection.x,
    y: gameState.snake.headLocation.y + currDirection.y
  }
  gameState.snake.locations.splice(0, 0, newLocation)
  if (!gameState.lastWasOrb) {
    gameState.snake.locations.pop()
  }
  gameState.lastWasOrb = false
  gameState.snake.headLocation = newLocation
}

function orb () {
  if (gameState.orb) {
    if (gameState.orb.x === gameState.snake.headLocation.x && gameState.orb.y === gameState.snake.headLocation.y) {
      gameState.score += 1
      gameState.orb = generateOrb()
      gameState.lastWasOrb = true
    }
  }
}

function generateOrb (): ICoordinate {
  let rx
  let ry

  do {
    rx = Math.trunc(Math.random() * (gridWidth))
    ry = Math.trunc(Math.random() * (gridWidth))
  } while (testSnakeCollision({ x: rx,y: ry }))
  return { x: rx, y: ry }
}

const engineKeyBinds = keybindings
  .reduce<IEngineKeyBind>((acc, curr, i): IEngineKeyBind => {
    curr.forEach((element, index) => {
      if (index !== 0) {
        acc[element] = curr[0]
      }
    })
    return acc
  }, {})

DEBUG && log(engineKeyBinds)

function handleKeyboard (event: KeyboardEvent) {
  event.preventDefault()

  if (engineKeyBinds[event.key]) {
    gameState.lastInput = engineKeyBinds[event.key]
  }
}

let lastFrameTimestamp: number = 0
let updateDelta: number = 0
let updateThreshold = 900
function gameLoop (timestamp: number) {
  const delta: number = timestamp - lastFrameTimestamp

  updateDelta += delta

  updateThreshold = 1000 - gameState.score * 25
  updateThreshold = updateThreshold < 5 || gameState.gameOver ? 5 : updateThreshold

  if (updateDelta > updateThreshold) {
    update(delta)
    updateDelta = 0
  }

  render(delta)

  // next frame
  lastFrameTimestamp = timestamp
  window.requestAnimationFrame(gameLoop)
}

canvas.addEventListener('keydown', handleKeyboard, true)
window.requestAnimationFrame(gameLoop)
gameState.orb = generateOrb()
