import { ClockHand } from 'apps/clock/hand'
import basicHandFrag from 'apps/clock/shaders/base.frag'
import basicHandVert from 'apps/clock/shaders/base.vert'

export class BasicHand extends ClockHand {

  constructor (context: WebGL2RenderingContext, width: number, height: number) {
    super(context, width, height)
  }

  protected get vertShader (): string {
    return basicHandVert
  }

  protected get fragShader (): string {
    return basicHandFrag
  }

  protected generator (width: number, height: number): Float32Array {
    return Float32Array.from([
      0, 0,
      -width, height / 3,
      width, height / 3,
      0, height
    ])
  }
}
