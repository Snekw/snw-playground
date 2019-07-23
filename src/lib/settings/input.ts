import { InputType } from 'lib/commonTypes'
import { getId } from 'lib/elementIdProvider'
import { ISetting } from 'lib/settings/settings'

export class Input implements ISetting {
  private inputBoxElement: HTMLInputElement
  private labelElement: HTMLLabelElement
  private readonly label: string
  private readonly inputType: InputType
  private host: HTMLElement

  public constructor (type: InputType, label: string) {
    this.label = label
    this.inputType = type
  }

  public detach (): void {
    this.host.removeChild(this.inputBoxElement)
    this.host.removeChild(this.labelElement)
    return
  }

  public getInputElement (): HTMLInputElement {
    return this.inputBoxElement
  }

  public setOnUpdate (): void {
    return
  }

  public attach (host: HTMLElement): void {
    this.host = host
    const inputId = getId()
    this.inputBoxElement = document.createElement('input')
    this.inputBoxElement.id = inputId
    this.inputBoxElement.type = this.inputType
    this.labelElement = document.createElement('label')
    this.labelElement.htmlFor = inputId
    this.labelElement.innerText = this.label

    this.host.appendChild(this.labelElement)
    this.host.appendChild(this.inputBoxElement)
  }
}
