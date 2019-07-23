let currId = 0

export const getId = () => {
  return `el${currId++}`
}
