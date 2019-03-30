// tslint:disable-next-line:no-console
export const log = (...messages: any[]) => console.log(...messages)

export const debug = (id: string, ...messages: any[]) => {
  if (messages.length > 0) {
    console.log(`${id}: ${messages}`)
    console.time(id)
  } else {
    console.timeEnd(id)
  }
}
