import { log } from 'lib/logger'

const ctx: Worker = self as any

ctx.onmessage = (event) => {
  log(event)
  postMessage('hi',null)
}
