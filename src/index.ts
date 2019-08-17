import 'styles/main.scss'

import { time } from 'lib/logger'

/**
 * Setup function to intialize everything
 */
function bootstrap () {
  const appFrame = document.getElementById('appIframe') as HTMLIFrameElement
  const appTemplate = document.getElementById('appTemplate') as HTMLTemplateElement

  /**
   * Load a new application to the frame
   * @param app New application to load
   */
  function loadApp (app: AppInfo): void {
    DEBUG && time('appload', `Loading app: ${app.title}`)

    appFrame.src = app.outPath
    appFrame.title = app.title

    DEBUG && time('appload')
  }

  // Setup eventlisteners
  function navClickListener (this: HTMLElement, e: Event) {
    e.preventDefault()
    e.stopPropagation()
    const app = APPS[parseInt(this.dataset.index, 10)]
    loadApp(app)
    return false
  }

  const appLinkList = document.querySelectorAll('#appsList ul li a')
  appLinkList.forEach((el) => el.addEventListener('click', navClickListener))
}

bootstrap()
