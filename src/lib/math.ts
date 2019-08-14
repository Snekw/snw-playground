export const pow = (i: number, p: number) => i ** p

/**
 * Clamp a number between two values.
 * @param val Input value
 * @param min Minimum value
 * @param max Maximum value
 * @param size Additional offset, applied to min (min + size) and max (max - size)
 */
export const clamp = (val: number, min: number, max: number, size = 0): number =>
    Math.min(Math.max(val, min + size), max - size)

/**
 * Get a random number between two values
 * @param min Minimum value
 * @param max Maximum value
 */
export const getRandomNumber = (min: number, max: number) => Math.random() * (max - min) + min

export interface IVec2<T = number> {
  x: T,
  y: T
}
