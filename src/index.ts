import 'styles/main.scss'

import { time } from 'lib/logger'

/**
 * Setup function to intialize everything
 */
function bootstrap () {
  const appContainer = document.getElementById('appContainer')
  const appTemplate = document.getElementById('appTemplate') as HTMLTemplateElement

  /**
   * Load a new application to the frame
   * @param app New application to load
   */
  function loadApp (app: AppInfo): void {
    DEBUG && time('appload', `Loading app: ${app.title}`)

    const template = document.importNode(appTemplate.content, true)
    template.querySelector('.appFrame')
      .setAttribute('src', app.outPath)
    const appReadmeContainer = template.querySelector('.appReadmeContainer')
    appReadmeContainer.querySelector('h1').textContent = ''
    appReadmeContainer.querySelector('article').textContent = ''

    while (appContainer.lastChild) {
      appContainer.removeChild(appContainer.lastChild)
    }
    appContainer.appendChild(template)

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

if (!('content' in document.createElement('template'))) {
  document.getElementById('unsupportedBrowser').classList.remove('hidden')
} else {
  bootstrap()
}
