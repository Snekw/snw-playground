import { ClockHand } from 'apps/clock/hand'
import classyHandFrag from 'apps/clock/shaders/base.frag'
import classyHandVert from 'apps/clock/shaders/base.vert'

export class ClassyHand extends ClockHand {

  constructor (context: WebGL2RenderingContext, width: number, height: number) {
    super(context, width, height)
  }

  protected get vertShader (): string {
    return classyHandVert
  }

  protected get fragShader (): string {
    return classyHandFrag
  }

  protected generator (width: number, height: number): Float32Array {
    return Float32Array.from([
      0.0, 0.0,
      -width, height,
      width, height,
      0.0, 1.0
    ])
  }
}
