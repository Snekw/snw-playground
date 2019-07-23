import { createResizer } from 'lib/renderUtil'
import { Input } from 'lib/settings/input'
import { Settings } from 'lib/settings/settings'
import 'styles/app.scss'

const canvas = document.createElement('canvas')

const resize = createResizer(canvas)
resize()
window.addEventListener('resize', resize)
document.body.appendChild(canvas)

const settings = Settings.createSettings([
  new Input('text', 'Text box'),
  new Input('number', 'Number Box'),
  new Input('range', 'Range Box'),
  new Input('checkbox', 'Check box')
])
