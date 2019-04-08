import { log } from 'lib/logger'

export enum SizingMode {
  Manual,
  Auto
}

export abstract class Engine {
  public get isPaused (): boolean {
    return this._isPaused

  }
  public set isPaused (v: boolean) {
    this._isPaused = v
    !this._isPaused && this.requestFrame()
  }

  public get sizingMode (): SizingMode {
    return this._sizingMode
  }
  public set sizingMode (v: SizingMode) {
    this._sizingMode = v
    if (this._sizingMode === SizingMode.Auto && !this._autoSizingListener) {
      this._autoSizingListener = this.resize.bind(this)
      window.addEventListener('resize', this._autoSizingListener, { passive: true })
    } else {
      window.removeEventListener('resize', this._autoSizingListener)
      this._autoSizingListener = null
    }
  }

  public get width (): number {
    return this._width
  }
  public set width (v: number) {
    this._width = v
  }

  public get height (): number {
    return this._height
  }
  public set height (v: number) {
    this._height = v
  }

  protected readonly gl: WebGL2RenderingContext
  protected readonly element: HTMLCanvasElement
  private _autoSizingListener?: () => void

  private _width: number = 0

  private _height: number = 0

  private _isPaused: boolean = false

  private _frame: number
  private _lastFrameTime: number = 0

  private _sizingMode: SizingMode = SizingMode.Auto

  constructor (element: HTMLCanvasElement) {
    // resolve context
    this.element = element
    this.gl = this.element.getContext('webgl2')
  }

  public resize () {
    this.element.width = window.innerWidth || 500
    this.element.height = window.innerHeight || 500

    this.width = this.element.width
    this.height = this.element.height
  }

  public abstract draw (delta: number): void
  public abstract preRender (delta: number): void
  public abstract postRender (delta: number): void

  /**
   * Request a new animation frame
   * DEPENDENCY: window.requestAnimationFrame
   */
  private requestFrame (): void {
    if (this._frame) {
      return
    }
    this._frame = window.requestAnimationFrame(this.renderLoop.bind(this))
  }

  private renderLoop (timestamp: number): void {
    const delta = timestamp - this._lastFrameTime

    this.preRender(delta)

    this.draw(delta)

    this.postRender(delta)
    this._lastFrameTime = timestamp
    this._frame = null
    !this._isPaused && this.requestFrame()
  }
}
