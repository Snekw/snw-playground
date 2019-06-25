import { ClockFace, ClockFaceConstructor } from 'apps/clock/clockFace'
import { ClockHand, ClockHandConstructor } from 'apps/clock/hand'
import { IWebgl2ClockRenderer } from 'apps/clock/webgl2ClockRenderer'

export class Webgl2Clock<
  ClockFaceType extends ClockFace,
  HourHandType extends ClockHand,
  MinuteHandType extends ClockHand,
  SecondHandType extends ClockHand
  > implements IWebgl2ClockRenderer {
  private x: number = 0
  private y: number = 0
  private readonly gl: WebGL2RenderingContext

  private face: ClockFaceType
  private hourHand: HourHandType
  private minuteHand: MinuteHandType
  private secondHand: SecondHandType

  constructor (
    gl: WebGL2RenderingContext,
    clockFace: ClockFaceConstructor<ClockFaceType>,
    hourHand: ClockHandConstructor<HourHandType>,
    minuteHand: ClockHandConstructor<MinuteHandType>,
    secondHand: ClockHandConstructor<SecondHandType>
  ) {
    this.gl = gl
    this.face = new clockFace()
    this.hourHand = new hourHand(gl, 40, 300)
    this.minuteHand = new minuteHand(gl, 30, 400)
    this.secondHand = new secondHand(gl, 20, 500)
  }

  public init (): void {
    this.update()
  }

  public update (): void {
    const now = new Date()
    this.hourHand.updateUniforms(this.x, this.y, -(now.getHours() / 12 * 360 + now.getMinutes() / 60 * 30))
    this.minuteHand.updateUniforms(this.x, this.y, -(now.getMinutes() / 60 * 360 + now.getSeconds() / 60 * 6))
    this.secondHand.updateUniforms(this.x, this.y, -(now.getSeconds() / 60 * 360 + now.getMilliseconds() / 1000 * 6))
  }

  public render (): void {
    this.face.draw()
    this.hourHand.draw()
    this.minuteHand.draw()
    this.secondHand.draw()
  }
}
