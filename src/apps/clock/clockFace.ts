import { IDrawable } from 'apps/clock/renderHelpers'

export type ClockFaceConstructor<T> = new () => T

export abstract class ClockFace implements IDrawable {
  public draw () { }
}
