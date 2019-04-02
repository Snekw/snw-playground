// tslint:disable-next-line:no-console
export const log = (...messages: any[]) => console.log(...messages)

export const time = (id: string, ...messages: any[]) => {
  if (messages.length > 0) {
    // tslint:disable-next-line:no-console
    console.log(`${id}: ${messages}`)
    // tslint:disable-next-line:no-console
    console.time(id)
  } else {
    // tslint:disable-next-line:no-console
    console.timeEnd(id)
  }
}
