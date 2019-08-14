import { InputType } from 'lib/commonTypes'
import { getId } from 'lib/elementIdProvider'
import { ISetting, OnSettingUpdate } from 'lib/settings/settings'

export class Input<T = any> implements ISetting {
  private inputBoxElement: HTMLInputElement
  private labelElement: HTMLLabelElement
  private readonly label: string
  private readonly inputType: InputType
  private readonly defaultValue: any
  private readonly onUpdate: OnSettingUpdate<T>
  private host: HTMLElement

  public constructor (type: InputType, label: string, onUpdate: OnSettingUpdate<T>, value?: T) {
    this.label = label
    this.inputType = type
    this.defaultValue = value
    this.onUpdate = onUpdate
    this.inputUpdate = this.inputUpdate.bind(this)
    if (value) {
      onUpdate(value)
    }
  }

  public detach (): void {
    this.inputBoxElement.removeEventListener('change', this.inputUpdate)
    this.host.removeChild(this.inputBoxElement)
    this.host.removeChild(this.labelElement)
    return
  }

  public getInputElement (): HTMLInputElement {
    return this.inputBoxElement
  }

  public attach (host: HTMLElement): void {
    this.host = host
    const inputId = getId()
    this.inputBoxElement = document.createElement('input')
    this.inputBoxElement.id = inputId
    this.inputBoxElement.type = this.inputType
    if (this.defaultValue) {
      if (this.inputType === 'checkbox') {
        this.inputBoxElement.checked = this.defaultValue
      } else {
        this.inputBoxElement.value = this.defaultValue
      }
    }
    this.inputBoxElement.addEventListener('change', this.inputUpdate)

    this.labelElement = document.createElement('label')
    this.labelElement.htmlFor = inputId
    this.labelElement.innerText = this.label

    this.host.appendChild(this.labelElement)
    this.host.appendChild(this.inputBoxElement)
  }

  private inputUpdate (ev: Event) {
    // so bad
    if (this.inputType === 'checkbox') {
      this.onUpdate(this.inputBoxElement.checked as unknown as T)
    } else {
      this.onUpdate(this.inputBoxElement.value as unknown as T)
    }
  }
}
