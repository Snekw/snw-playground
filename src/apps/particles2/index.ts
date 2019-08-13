import 'styles/app.scss'
import { Particle, ParticleSystem } from './particle'

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

const particles: Array<{ life: number, particle: Particle }> = []

let isMouseDown = false

const spawnParticleToMouse = (location: {clientX: number, clientY: number}) => {
  const x = (location.clientX / window.innerWidth * 2) - 1
  const y = (location.clientY / window.innerHeight * -2) + 1

  particles.push({
    life: 1000,
    particle: particleSystem.generate(100, { x, y })
  })
}

canvas.addEventListener('click', (ev: MouseEvent) => {
  spawnParticleToMouse(ev)
})

canvas.addEventListener('mousedown',() => isMouseDown = true)
canvas.addEventListener('mouseup',() => isMouseDown = false)
canvas.addEventListener('mouseleave',() => isMouseDown = false)

canvas.addEventListener('mousemove', (ev: MouseEvent) => {
  if (isMouseDown) {
    spawnParticleToMouse(ev)
  }
})

let lastUpdate = 0
let nUpdates = -1
const autoUpdate = (timestamp: number) => {
  const delta = (timestamp - lastUpdate)
  lastUpdate = timestamp

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clearColor(0.2, 0.2, 0.2, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  for (let i = 0; i < particles.length; i++) {
    particles[i].life -= delta
    if (particles[i].life < 0) {
      particles.splice(i, 1)
    } else {
      particles[i].particle.update(delta)
    }
  }

  if (nUpdates > 0 || nUpdates === -1) {
    window.requestAnimationFrame(autoUpdate)
    if (nUpdates !== -1) {
      nUpdates--
    }
  }
}

window.requestAnimationFrame(autoUpdate)
