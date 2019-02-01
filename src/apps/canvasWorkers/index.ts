import { log } from 'lib/logger'
import { pow } from 'lib/math'
import Worker from 'worker-loader?name=workers/[name].[contenthash].worker.js&publicPath=/!workers/test'
// import * as Worker from 'workers/test'

log(pow(3, 1))

const worker = new Worker()

worker.postMessage('asd')

worker.addEventListener('message', (event) => {
  log(event)
})
