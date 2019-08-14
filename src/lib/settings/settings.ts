import { IVec2 } from 'lib/math'

export interface ISettingsStyle {
  backgroundColor?: string
}

export type OnSettingUpdate<T> = (value: T) => void

export class Settings {

  public static createSettings (settings: ISetting[], style?: ISettingsStyle): Settings {
    const newSettings = new Settings(style)

    // Add new settings
    settings.forEach((s) => newSettings.addSetting(s))

    return newSettings
  }

  private readonly element: HTMLDivElement
  private settings: ISetting[] = []

  private location: IVec2 = { x: 0, y: 0 }

  private constructor (style?: ISettingsStyle) {
    this.element = document.createElement('div')
    this.element.classList.add('settings-container')
    if (style) {
      this.element.style.backgroundColor = style.backgroundColor ? style.backgroundColor : ''
    }

    this.updateLocation()

    document.body.appendChild(this.element)
  }

  public setLocation (location: IVec2): void {
    this.location.x = location.x
    this.location.y = location.y
    this.updateLocation()
    return
  }

  private updateLocation () {
    this.element.style.top = `${this.location.y}px`
    this.element.style.left = `${this.location.x}px`
  }

  private addSetting (setting: ISetting): void {
    this.settings.push(setting)
    const hostElement: HTMLDivElement = document.createElement('div')
    setting.attach(hostElement)
    this.element.appendChild(hostElement)
  }
}

export interface ISetting {
  attach: (host: HTMLElement) => void,
  detach: () => void
}
