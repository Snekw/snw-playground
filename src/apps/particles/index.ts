import { ParticleSystem } from 'apps/particles/particle'
import 'styles/app.scss'

import basicParticleFrag from './shaders/basicParticle.frag'
import basicParticleTransform from './shaders/basicParticle.transform'
import basicParticleVert from './shaders/basicParticle.vert'
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

const particleSystem = new ParticleSystem(gl, basicParticleTransform, basicParticleVert, basicParticleFrag)

const particle = particleSystem.generate(100000)

const draw = () => {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clearColor(0.2, 0.2, 0.2, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  particle.draw()
}

const update = () => {
  particle.update()
}

let lastUpdate = 0
let nUpdates = -1
const autoUpdate = (timestamp: number) => {
  const delta = lastUpdate - timestamp
  lastUpdate = timestamp

  update()
  draw()

  if (nUpdates > 0 || nUpdates === -1) {
    window.requestAnimationFrame(autoUpdate)
    if (nUpdates !== -1) {
      nUpdates--
    }
  }
}

window.requestAnimationFrame(autoUpdate)
