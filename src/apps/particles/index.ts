import { Particle, ParticleSystem } from 'apps/particles/particle'
import 'styles/app.scss'

import { IVec2 } from 'lib/math'
import { Input } from 'lib/settings/input'
import { Settings } from 'lib/settings/settings'
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

let particle: Particle | undefined
const particleSystem = new ParticleSystem(gl, basicParticleTransform, basicParticleFrag)
let mouseLoc: IVec2 = { x: -2, y: 0 }
let mouseLocReset: IVec2 = { x: 0, y: 0 }

const settings = Settings.createSettings([
  new Input('number', 'Number of particles:', createParticles, 100000),
  new Input<boolean>('checkbox', 'Gravity at center if no mouse', setGravityAtCenterEnabled, true)
])

settings.visibility(false)

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

createParticles(100000)

function createParticles (nParticles: number) {
  if (particle) {
    particle.destroy()
  }
  particle = particleSystem.generate(nParticles)
}

function setGravityAtCenterEnabled (state: boolean) {
  if (state) {
    mouseLocReset = { x: 0, y: 0 }
  } else {
    mouseLocReset = { x: -2, y: -2 }
  }
  mouseLoc = mouseLocReset
}

let repel: boolean = false

canvas.addEventListener('mousemove', (ev: MouseEvent) => {
  const x = (ev.clientX / window.innerWidth * 2) - 1
  const y = (ev.clientY / window.innerHeight * -2) + 1
  mouseLoc = { x, y }
}, { passive: true })
canvas.addEventListener('touchmove', (ev: TouchEvent) => {
  for (let i = 0; i < ev.changedTouches.length; i++) {
    const t = ev.changedTouches[i]
    const x = (t.clientX / window.innerWidth * 2) - 1
    const y = (t.clientY / window.innerHeight * -2) + 1
    mouseLoc = { x, y }
  }
}, { passive: true })

canvas.addEventListener('touchend', () => {
  mouseLoc = mouseLocReset
}, { passive: true })
canvas.addEventListener('mouseout', () => {
  mouseLoc = mouseLocReset
}, { passive: true })

canvas.addEventListener('mousedown', () => repel = true, { passive: true })
canvas.addEventListener('mouseup', () => repel = false, { passive: true })
canvas.addEventListener('mouseout', () => repel = false, { passive: true })

let nUpdates = -1
let lastUpdate = 0
const autoUpdate = (timestamp: number) => {
  const delta = (timestamp - lastUpdate)
  lastUpdate = timestamp

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.clearColor(0.2, 0.2, 0.2, 1)
  gl.clear(gl.COLOR_BUFFER_BIT)

  particle.update(delta, mouseLoc, repel)

  if (nUpdates > 0 || nUpdates === -1) {
    window.requestAnimationFrame(autoUpdate)
    if (nUpdates !== -1) {
      nUpdates--
    }
  }
}

window.requestAnimationFrame(autoUpdate)
