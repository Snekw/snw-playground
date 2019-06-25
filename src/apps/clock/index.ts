import { BasicFace } from 'apps/clock/clockParts/faces/basicFace'
import { BasicHand } from 'apps/clock/clockParts/hands/basicHand'
import { Webgl2Clock } from 'apps/clock/webgl2Clock'
import { Webgl2ClockRenderer } from 'apps/clock/webgl2ClockRenderer'
import { clamp, getRandomNumber } from 'lib/math'
import 'styles/app.scss'
/**
 * Common options for the app
 */
const options = {
  /**
   * Pause rendering
   */
  isPaused: false
}

const canvas = document.createElement('canvas')

// canvas size
const resize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)
document.body.appendChild(canvas)

const gl: WebGL2RenderingContext = canvas.getContext('webgl2')

const clockRenderer = new Webgl2ClockRenderer(gl)

const clock1 = new Webgl2Clock(gl, BasicFace, BasicHand, BasicHand, BasicHand)

clockRenderer.addClock(clock1)

// rendering
const renderLoop: FrameRequestCallback = (): void => {
  clockRenderer.render()
  window.requestAnimationFrame(renderLoop)
}

window.requestAnimationFrame(renderLoop)
