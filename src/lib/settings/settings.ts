import { IVec2 } from 'lib/math'

export interface ISettingsStyle {
  backgroundColor?: string,
  borderColor?: string
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
  private readonly settingsList: HTMLDivElement
  private readonly settingsDrawer: HTMLDivElement
  private settings: ISetting[] = []
  private visible: boolean = true
  private style?: ISettingsStyle

  private location: IVec2 = { x: 0, y: 0 }

  private constructor (style?: ISettingsStyle) {
    this.style = style
    this.element = document.createElement('div')

    this.settingsDrawer = document.createElement('div')
    this.settingsDrawer.classList.add('settings-drawer')
    this.settingsDrawer.textContent = '<<'
    this.settingsDrawer.addEventListener('click', () => {
      this.visibility(!this.visible)
    })

    this.element.appendChild(this.settingsDrawer)
    this.settingsList = document.createElement('div')

    this.element.appendChild(this.settingsList)
    this.element.classList.add('settings-container')
    if (style) {
      this.element.style.backgroundColor = style.backgroundColor ? style.backgroundColor : ''
      this.element.style.borderColor = style.borderColor ? style.borderColor : ''
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

  public visibility (state: boolean) {
    this.visible = state

    if (this.visible) {
      this.settingsList.classList.remove('settings-hidden')
      this.element.style.backgroundColor =
        this.style ? this.style.backgroundColor ? this.style.backgroundColor : '' : ''
      this.element.style.borderColor =
        this.style ? this.style.borderColor ? this.style.borderColor : '' : ''
      this.settingsDrawer.textContent = '<<'
    } else {
      this.settingsList.classList.add('settings-hidden')
      this.element.style.backgroundColor = '#00000000'
      this.element.style.borderColor = '#00000000'
      this.settingsDrawer.textContent = '>>'
    }
  }

  private updateLocation () {
    this.element.style.top = `${this.location.y}px`
    this.element.style.left = `${this.location.x}px`
  }

  private addSetting (setting: ISetting): void {
    this.settings.push(setting)
    const hostElement: HTMLDivElement = document.createElement('div')
    setting.attach(hostElement)
    this.settingsList.appendChild(hostElement)
  }
}

export interface ISetting {
  attach: (host: HTMLElement) => void,
  detach: () => void
}
