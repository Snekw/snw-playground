import { ParticleSystem } from 'apps/particles/particle'
import 'styles/app.scss'

import { IVec2 } from 'lib/math'
import basicParticleFrag from './shaders/basicParticle.frag'
import basicParticleTransform from './shaders/basicParticle.transform'
// create canvas
/**
 * The canvas used for rendering
 */
const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

/**
 * The graphics context to use
 */
const gl = canvas.getContext('webgl2')
gl.clearColor(0, 0, 0, 0)

/**
 * Resize the canvas
 */
const resize = () => {
  canvas.width = window.innerWidth || 500
  canvas.height = window.innerHeight || 500
}
resize()
// bind the window resize to the resize function
window.onresize = resize

const particleSystem = new ParticleSystem(gl, basicParticleTransform, basicParticleFrag)

const particle = particleSystem.generate(200000)

let mouseLoc: IVec2 = { x: 0, y: 0 }
let repel: boolean = false

canvas.addEventListener('mousemove', (ev: MouseEvent) => {
  const x = (ev.clientX / window.innerWidth * 2) - 1
  const y = (ev.clientY / window.innerHeight * -2) + 1
  mouseLoc = { x, y }
})

canvas.addEventListener('mouseout', () => {
  mouseLoc = { x: 0, y: 0 }
})

canvas.addEventListener('mousedown', () => repel = true)
canvas.addEventListener('mouseup', () => repel = false)
canvas.addEventListener('mouseout', () => repel = false)

let nUpdates = -1
const autoUpdate = () => {

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clearColor(0.2, 0.2, 0.2, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  particle.update(mouseLoc, repel)

  if (nUpdates > 0 || nUpdates === -1) {
    window.requestAnimationFrame(autoUpdate)
    if (nUpdates !== -1) {
      nUpdates--
    }
  }
}

window.requestAnimationFrame(autoUpdate)
