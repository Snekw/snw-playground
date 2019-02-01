/**
 * Canvas worker post message data interface
 */
export interface ICanvasWorkerPostMessage {
  /**
   * Number of balls
   */
  ballCount: number,
  /**
   * Size of the batch for the worker
   */
  batchSize: number,
  /**
   * Byte lenght of the data for single ball
   */
  ballByteLength: number,
  /**
   * Byte lenght of the single element in the shared buffer
   */
  elementByteLength: number,
  /**
   * Connections data shared buffer
   */
  connsSab: SharedArrayBuffer,
  /**
   * Height of the canvas
   */
  height: number,
  /**
   * Width of the canvas
   */
  width: number,
  /**
   *
   */
  maxConns: number,
  /**
   * Data shared buffer
   */
  sab: SharedArrayBuffer,
  /**
   * The index of the first ball data for this worker
   */
  startIndex: number,
  /**
   * The maximum distance between two balls for it to be considered in the connection check
   */
  maxDistance: number
}
