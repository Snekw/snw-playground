/**
 * Canvas worker post message data interface
 */
export interface ICanvasWorkerPostMessage {
  /**
   * Byte length of the data for single ball
   */
  ballByteLength: number,

  /**
   * Number of balls
   */
  ballCount: number,

  /**
   * Size of the batch for the worker
   */
  batchSize: number,

  /**
   * Connections data shared buffer
   */
  connsSab: SharedArrayBuffer,

  /**
   * Byte length of the single element in the shared buffer
   */
  elementByteLength: number,

  /**
   * Height of the canvas
   */
  height: number,

  /**
   * Maximum number of connections between balls
   */
  maxConns: number,

  /**
   * The maximum distance between two balls for it to be considered in the connection check
   */
  maxDistance: number,

  /**
   * Data shared buffer
   */
  sab: SharedArrayBuffer,

  /**
   * The index of the first ball data for this worker
   */
  startIndex: number,

  /**
   * Width of the canvas
   */
  width: number
}

/**
 * Command interface
 */
export interface IWebglWorkerCommandMessage {
  cmd: string
}

/**
 * WebGl worker post message data interface
 */
export interface IWebglWorkerPostMessage {
  /**
   * Byte length of the single element in the shared ball buffer
   */
  ballArrByteLength: number,

  /**
   * Byte length of the data for single ball
   */
  ballByteLength: number,

  /**
   * Number of balls
   */
  ballCount: number,

  /**
   * Data shared buffer
   */
  ballSAB: SharedArrayBuffer,

  /**
   * Size of the batch for the worker
   */
  batchSize: number,

  /**
   * Byte lenght of the single element in the shared connections buffer
   */
  connArrByteLength: number,

  /**
   * Byte length of the data for single connection
   */
  connByteLength: number,

  /**
   * Number of elements per connection
   */
  connElementCount: number,

  /**
   * Connections data shared buffer
   */
  connSAB: SharedArrayBuffer,

  /**
   * Height of the canvas
   */
  height: number,

  /**
   * Is the data little endian
   */
  isLittleEndian: boolean,

  /**
   * Should this worker be considered the master worker
   */
  master: boolean,

  /**
   * Maximum number of connections between balls
   */
  maxConns: number,

  /**
   * The maximum distance between two balls for it to be considered in the connection check
   */
  maxDistance: number,

  /**
   * The index of the first ball data for this worker
   */
  startIndex: number,

  /**
   * Width of the canvas
   */
  width: number
}
