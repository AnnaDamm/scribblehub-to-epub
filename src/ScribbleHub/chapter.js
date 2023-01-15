import { Browser } from '../Browser/browser.js'
import { chapterLoaded, ChapterLoadedEvent } from '../Events/chapter-loaded.js'
import { eventEmitter } from '../Events/event-emitter.js'

/**
 * @property {string} title
 * @property {string} text
 */
export class Chapter {
  /**
   * @param {AssetDownloader} assetDownloader
   * @param {URL} url
   * @returns {Promise<void>}
   */
  async load (assetDownloader, url) {
    const page = await Browser.newPage()
    await page.goto(url.toString())
    await page.waitForSelector('body')

    await Promise.all([
      async () => { this.title = await page.$eval('.chapter-title', (node) => node.innerHTML) },
      async () => { this.text = await page.$eval('#chp_contents', (node) => node.innerHTML) },
      () => assetDownloader.fetchImagesFromQuery(page, '#chp_contents img[src]')
    ].map((func) => func()))
    eventEmitter.emit(chapterLoaded, new ChapterLoadedEvent(this))
  }
}
